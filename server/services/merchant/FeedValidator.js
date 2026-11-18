class FeedValidator {
  /**
   * Validates a row from a product feed
   * @param {Object} row 
   * @param {number} rowIndex 
   * @returns {Object} { isValid: boolean, errors: Array }
   */
  static validateRow(row, rowIndex) {
    const errors = [];
    let isValid = true;

    if (!row.id || !row.title || !row.price) {
      errors.push({
        row: rowIndex,
        severity: 'FATAL',
        message: 'Missing required fields (id, title, price)'
      });
      isValid = false;
    }

    if (row.price && isNaN(Number(row.price))) {
      errors.push({
        row: rowIndex,
        severity: 'FATAL',
        message: `Invalid price format: ${row.price}`
      });
      isValid = false;
    }

    if (!row.image_link) {
      errors.push({
        row: rowIndex,
        severity: 'RECOVERABLE',
        message: 'Missing image_link, product will not have a picture'
      });
    }

    return { isValid, errors };
  }
}

module.exports = FeedValidator;
