/**
 * Gets the repositories of the user from Github
 */

import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import set from 'lodash/fp/set';
import get from 'lodash/fp/get';

import Location from 'models/Location';
import MetaWeatherFetcher from 'fetchers/MetaWeatherFetcher';
import {
  searchLocationSuccessAction,
  searchLocationFailedAction,
} from 'containers/HomePage/actions';
import { SEARCH_LOCATION } from './constants';

/**
 * Home saga
 */
export default function* saga() {
  yield all([fork(searchLocationWatcher)]);
}

export function* searchLocationWatcher() {
  yield takeLatest(SEARCH_LOCATION, searchLocationTask);
}

/**
 * Search location request/response handler
 */
export function* searchLocationTask(action) {
  const { location } = action;

  const { response, error } = yield call(searchLocationFetcher, location);
  if (response) {
    const locations = map(
      item =>
        flow(
          set('title', get('title', item)),
          set('woeid', get('woeid', item)),
          set('locationType', get('location_type', item)),
          set('lattLong', get('latt_long', item)),
        )(new Location()),
      response,
    );
    yield put(searchLocationSuccessAction(locations));
  } else {
    yield put(searchLocationFailedAction(error));
  }
}

export const searchLocationFetcher = (location: string) => {
  const fetcher = new MetaWeatherFetcher();
  return fetcher.fetchLocation(location);
};
