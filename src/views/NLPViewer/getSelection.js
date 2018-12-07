export default function(context) {
    const sel = window.getSelection();
    if (sel.type !== 'Range') return {
        start: 0,
        end: 0,
        tags: []
    };

    const range = sel.getRangeAt(0);

    const startNodeId = range.startContainer.parentNode.id;
    const endNodeId = range.endContainer.parentNode.id;
    /*
    console.log(range.endContainer)
    console.log(endNodeId)
    console.log(endNodeId.match(/text\-([0-9]+)/));
    */
    const startIndex = parseInt(startNodeId.match(/text\-([0-9]+)/)[1]);
    const endIndex = parseInt(endNodeId.match(/text\-([0-9]+)/)[1]);


    let start = startIndex+range.startOffset;
    // console.log(start,startNodeId,range.startOffset,range.endOffset)


    // // handle pre
    // for (let i = 0; i < startIndex; i++) {
    //     const ele = context.refs[`text-${i}`];
    //     const content = ele.innerHTML;
    //     start += content.length;
    // }
    let end = range.endOffset + start - range.startOffset;
    // handle post
    // for (let i = startIndex; i < endIndex; i++) {
    //     const ele = context.refs[`text-${i}`];
    //     const content = ele.innerHTML;
    //     end += content.length;
    // }

    // console.log(start, end)

    return {
        start,
        end,
        tags: _.range(startIndex, endIndex + 1).map(i => `block-${i}`)
    };
}
