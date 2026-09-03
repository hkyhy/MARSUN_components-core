// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/CentralContent/boxComputed.js
const boxComputed = (columns, col) => {
  const box = [];
  columns.forEach((item, index) => {
    const currentSpan = (() => {
      if (item.block) {
        return 24;
      }
      if (item.span) {
        return item.span;
      }
      return 24 / (item.col || col);
    })();
    if (box.length === 0) {
      box.push([]);
    }
    let currentLine = box[box.length - 1];
    let legacy =
      24 -
      currentLine.reduce((a, b) => {
        return a + b.span;
      }, 0);
    if (legacy < currentSpan) {
      currentLine[currentLine.length - 1].span += legacy;
      box.push([]);
      legacy = 24;
      currentLine = box[box.length - 1];
    }
    const isLast = index === columns.length - 1;
    currentLine.push(Object.assign({}, item, { span: isLast ? legacy : currentSpan }));
  });

  return box.reduce((a, b) => {
    return a.concat(b);
  }, []);
};

export default boxComputed;
