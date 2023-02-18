export function throwTimeoutError(e, timeoutErrorInfo) {
  if (e.code === 'ETIMEDOUT') {
    let db = '';
    if (timeoutErrorInfo.connection.filename) {
      // for sqlite
      db = timeoutErrorInfo.connection.filename;
    } else if (
      timeoutErrorInfo.connection.database &&
      timeoutErrorInfo.connection.host &&
      timeoutErrorInfo.connection.port
    ) {
      db = `${timeoutErrorInfo.connection.database} (${timeoutErrorInfo.connection.host}:${timeoutErrorInfo.connection.port})`;
    }
    throw new Error(
      `Failed to connect the database ${db} for Project ${timeoutErrorInfo.projectTitle}.
       Please fix the connection issue or remove the project before trying to upgrade.`
    );
  }
}
