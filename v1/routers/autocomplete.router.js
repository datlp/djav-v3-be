'use strict';

const express = require('express');
const router = express.Router();
const Suggestion = require('../models/suggestion.model');
const SearchHistory = require('../models/searchHistory.model');
const { get } = require('lodash');
const { getUser } = require('../middlewares/auth.middleware');

const DEFAULT_LIMIT = 10;
const ENUM_TYPES = ['prefix', 'subsequence', 'fuzzy', 'ngram', 'semantic'];
const DEFAULT_AUTOCOMPLETE_TYPE = 'prefix';

// Helper function to fetch suggestions from the Suggestion model
async function fetchSuggestionResults(query, type, limit) {
  let results = [];
  switch (type) {
    case 'prefix':
      const prefixRegex = new RegExp(`^${query}`, 'i');
      results = await Suggestion.find({ suggestion: prefixRegex })
        .sort({ popularity: -1 })
        .limit(limit);
      break;
    case 'subsequence':
      const subsequenceRegex = query.toLowerCase().split('').join('.*');
      const subRegex = new RegExp(subsequenceRegex, 'i');
      results = await Suggestion.find({ suggestion: subRegex })
        .sort({ popularity: -1 })
        .limit(limit);
      break;
    case 'fuzzy':
      const words = query.toLowerCase().trim().split(/\s+/);
      const fuzzyRegexParts = words.map(
        (word) => `(?=.*${word.split('').join('.*?')})`
      );
      const fuzzyRegex = new RegExp(`^${fuzzyRegexParts.join('')}.*`, 'i');
      results = await Suggestion.find({ suggestion: fuzzyRegex })
        .sort({ popularity: -1 })
        .limit(limit);
      break;
    case 'ngram':
      const n = 2; // Configuration: N-gram size
      const ngrams = [];
      const ngramWords = query.toLowerCase().split(/\s+/).filter(Boolean);
      for (let i = 0; i <= ngramWords.length - n; i++) {
        ngrams.push(ngramWords.slice(i, i + n).join(' '));
      }
      if (ngrams.length > 0) {
        const ngramRegex = new RegExp(
          ngrams.map((ngram) => `(?=.*\\b${ngram}\\b)`).join(''),
          'i'
        );
        results = await Suggestion.find({ suggestion: ngramRegex })
          .sort({ popularity: -1 })
          .limit(limit);
      } else {
        const prefixFallbackRegex = new RegExp(`^${query}`, 'i');
        results = await Suggestion.find({ suggestion: prefixFallbackRegex })
          .sort({ popularity: -1 })
          .limit(limit);
      }
      break;
    case 'semantic':
      const semanticWords = query.toLowerCase().trim().split(/\s+/);
      const semanticRegex = new RegExp(
        semanticWords.map((word) => `(?=.*\\b${word}\\b)`).join(''),
        'i'
      );
      results = await Suggestion.find({ suggestion: semanticRegex })
        .sort({ popularity: -1 })
        .limit(limit);
      break;
    default: // 'prefix'
      const defaultPrefixRegex = new RegExp(`^${query}`, 'i');
      results = await Suggestion.find({ suggestion: defaultPrefixRegex })
        .sort({ popularity: -1 })
        .limit(limit);
      break;
  }
  return results;
}

// Helper function to fetch search history for the authenticated user
async function fetchHistoryResults(query, type, limit, userId) {
  if (!userId) {
    return [];
  }
  let results = [];
  switch (type) {
    case 'prefix':
      const prefixRegex = new RegExp(`^${query}`, 'i');
      results = await SearchHistory.find({ user: userId, query: prefixRegex })
        .sort({ timestamp: -1 })
        .limit(limit);
      break;
    case 'subsequence':
      const subsequenceRegex = query.toLowerCase().split('').join('.*');
      const subRegex = new RegExp(subsequenceRegex, 'i');
      results = await SearchHistory.find({ user: userId, query: subRegex })
        .sort({ timestamp: -1 })
        .limit(limit);
      break;
    case 'fuzzy':
      const words = query.toLowerCase().trim().split(/\s+/);
      const historyFuzzyRegex = new RegExp(words.join('.*?'), 'i');
      results = await SearchHistory.find({
        user: userId,
        query: historyFuzzyRegex,
      })
        .sort({ timestamp: -1 })
        .limit(limit);
      break;
    case 'ngram':
      const n = 2; // Configuration: N-gram size
      const ngrams = [];
      const ngramWords = query.toLowerCase().split(/\s+/).filter(Boolean);
      for (let i = 0; i <= ngramWords.length - n; i++) {
        ngrams.push(ngramWords.slice(i, i + n).join(' '));
      }
      if (ngrams.length > 0) {
        const ngramRegex = new RegExp(
          ngrams.map((ngram) => `(?=.*\\b${ngram}\\b)`).join(''),
          'i'
        );
        results = await SearchHistory.find({ user: userId, query: ngramRegex })
          .sort({ timestamp: -1 })
          .limit(limit);
      } else {
        const prefixFallbackRegex = new RegExp(`^${query}`, 'i');
        results = await SearchHistory.find({
          user: userId,
          query: prefixFallbackRegex,
        })
          .sort({ timestamp: -1 })
          .limit(limit);
      }
      break;
    case 'semantic':
      const semanticWords = query.toLowerCase().trim().split(/\s+/);
      const historySemanticRegex = new RegExp(semanticWords.join('|'), 'i');
      results = await SearchHistory.find({
        user: userId,
        query: historySemanticRegex,
      })
        .sort({ timestamp: -1 })
        .limit(limit);
      break;
    default: // 'prefix'
      const defaultPrefixRegex = new RegExp(`^${query}`, 'i');
      results = await SearchHistory.find({
        user: userId,
        query: defaultPrefixRegex,
      })
        .sort({ timestamp: -1 })
        .limit(limit);
      break;
  }
  return results;
}

router.get('/', getUser, async (req, res) => {
  const { query, type = DEFAULT_AUTOCOMPLETE_TYPE } = req.query;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;
  const userId = get(req, 'user._id', null);

  if (!query) {
    return res.status(400).json([]);
  }

  try {
    const suggestionResults = await fetchSuggestionResults(
      query,
      type.toLowerCase(),
      limit
    );
    const historyResults = await fetchHistoryResults(
      query,
      type.toLowerCase(),
      limit,
      userId
    );

    const combinedSuggestions = new Set();
    suggestionResults.forEach((s) => combinedSuggestions.add(s.suggestion));
    historyResults.forEach((h) => combinedSuggestions.add(h.query));

    const finalSuggestions = Array.from(combinedSuggestions).slice(0, limit);

    res.json(finalSuggestions);
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
