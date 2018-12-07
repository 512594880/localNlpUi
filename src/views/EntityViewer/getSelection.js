export default function(context) {
    const sel = window.getSelection();
    if (sel.type !== 'Range') return {
        start: 0,
        end: 0
    };

    const range = sel.getRangeAt(0);


    let startNodeId = range.startContainer.parentNode.id;
    let endNodeId = range.endContainer.parentNode.id;

    if (startNodeId === '' &&
        endNodeId === '') {
        startNodeId = range.startContainer.parentNode.parentNode.id;
        endNodeId = range.endContainer.parentNode.parentNode.id;
    }

    console.info('[SEL]', `${startNodeId}, ${endNodeId}`);
    const start = parseInt(startNodeId.match(/char\-([0-9]+)/)[1]);
    const end = parseInt(endNodeId.match(/char\-([0-9]+)/)[1]);

    return {
        start,
        end
    };
}
