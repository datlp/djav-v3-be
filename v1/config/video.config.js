const moment = require('moment');
const FIELD_SELECT = [
  '-_id',

  'video_dvd',
  'video_title',
  'video_covers',
  'video_files',
  'video_views',
  'video_fileMaxSize',

  'video_release',
  'video_lastViewed',
  'createOn',
  'modifyOn',
];

const ASCENDING = 1;
const DESCENDING = -1;

exports.FIELD_SELECT = FIELD_SELECT;

class FeedConfigFactory {
  static createConfig(feedType) {
    const feedConfig = {
      size: this._sizeConfig,
      create: this._createConfig,
      release: this._releaseConfig,
      popular: this._popularConfig,
      recommend: this._recommendConfig,
      history: this._historyConfig,
      'top-week': this._topWeekConfig,
      'top-month': this._topMonthConfig,
      'top-quarter': this._topQuarterConfig,
      'top-year': this._topYearConfig,
      votes: this._votesConfig,
      '-size': this._negativeSizeConfig,
      '-create': this._negativeCreateConfig,
      '-release': this._negativeReleaseConfig,
      '-popular': this._negativePopularConfig,
      '-recommend': this._negativeRecommendConfig,
      '-history': this._negativeHistoryConfig,
      '-top-week': this._negativeTopWeekConfig,
      '-top-month': this._negativeTopMonthConfig,
      '-top-quarter': this._negativeTopQuarterConfig,
      '-top-year': this._negativeTopYearConfig,
      '-votes': this._negativeVotesConfig,
    };
    if (!feedConfig[feedType])
      throw new Error(`Unknown feed type: ${feedType}`);

    return feedConfig[feedType]();
  }

  static _sizeConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { video_fileMaxSize: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _createConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { createOn: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _releaseConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { video_release: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _popularConfig() {
    return {
      filter: { video_files: { $gt: 0 }, video_views: { $gt: 0 } },
      sort: { video_views: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _recommendConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $lt: 1 },
      },
      sort: { video_release: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _historyConfig() {
    return {
      filter: { video_files: { $gt: 0 }, video_views: { $gt: 0 } },
      sort: { video_lastViewed: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _topWeekConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(7, 'days').toISOString() },
      },
      sort: { video_views: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _topMonthConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(1, 'months').toISOString() },
      },
      sort: { video_views: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _topQuarterConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: {
          $gte: moment().subtract(3, 'months').toISOString(),
        },
      },
      sort: { video_views: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _topYearConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(1, 'years').toISOString() },
      },
      sort: { video_views: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _votesConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_votes: { $gt: 0 },
      },
      sort: { video_lastViewed: DESCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeSizeConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { video_fileMaxSize: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeCreateConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { createOn: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeReleaseConfig() {
    return {
      filter: { video_files: { $gt: 0 } },
      sort: { video_release: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativePopularConfig() {
    return {
      filter: { video_files: { $gt: 0 }, video_views: { $gt: 0 } },
      sort: { video_views: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }
  static _negativeRecommendConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $lt: 1 },
      },
      sort: { video_release: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeHistoryConfig() {
    return {
      filter: { video_files: { $gt: 0 }, video_views: { $gt: 0 } },
      sort: { video_lastViewed: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeTopWeekConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(7, 'days').toISOString() },
      },
      sort: { video_views: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeTopMonthConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(1, 'months').toISOString() },
      },
      sort: { video_views: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeTopQuarterConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: {
          $gte: moment().subtract(3, 'months').toISOString(),
        },
      },
      sort: { video_views: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }

  static _negativeTopYearConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_views: { $gt: 0 },
        video_release: { $gte: moment().subtract(1, 'years').toISOString() },
      },
      sort: { video_views: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }
  static _negativeVotesConfig() {
    return {
      filter: {
        video_files: { $gt: 0 },
        video_votes: { $gt: 0 },
      },
      sort: { video_lastViewed: ASCENDING, _id: DESCENDING },
      select: FIELD_SELECT,
    };
  }
}

exports.FeedConfigFactory = FeedConfigFactory;
