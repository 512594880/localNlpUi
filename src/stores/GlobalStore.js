import {
    createStore
} from 'redux';

import {
    fromJS
} from 'immutable';

const defaultState = fromJS({
    loading: 0
});

const GlobalStore = createStore(function(state = defaultState, action) {
    switch (action.type) {
        case 'Load':
            return state.set('loading', state.get('loading') + 1);
        case 'Loaded':
            return state.set('loading', state.get('loading') - 1);
        default:
            return state;
    }
});

export default GlobalStore;
