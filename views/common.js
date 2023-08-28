async function refreshAccessToken() {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;

    if (status === 401) {
      throw new Error(401);
    } else if (status === 500) {
      throw new Error(500);
    }
  } catch (error) {
    const { message } = error;

    if (message === '500') {
      statusMessage.textContent = '오류 발생';
    } else {
      statusMessage.textContent = '네트워크 오류 발생';
    }
  }
}

const tokenRefreshInterval = 15 * 60 * 1000; // 15분

setInterval(async () => {
  try {
    await refreshAccessToken();
  } catch (error) {
    console.error(error);
  }
}, tokenRefreshInterval);
