function runBackgroundTask(name, task, timeoutMs = 15000) {
  setImmediate(() => {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${name} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    Promise.race([Promise.resolve().then(task), timeout])
      .catch((error) => {
        console.error(`[background:${name}] ${error.message}`);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
}

module.exports = runBackgroundTask;
