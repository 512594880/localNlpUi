import FileStore from '../stores/FileStore';

export const LoadURL = (url) =>
    FileStore.dispatch({
        type: 'LoadURL',
        url
    });
