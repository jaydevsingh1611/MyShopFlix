import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8080'; // Change this to your backend API URL

/**
 * Places an order by sending a POST request to the backend with JWT token.
 *
 * @param {OrderRequest} orderRequest - The order payload.
 * @returns {Promise<any>} Response from the backend.
 * @throws Will throw an error with a user-friendly message.
 */
export async function placeOrder(orderRequest) {
  const token = localStorage.getItem('jwtToken');

  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  try {

    const response = await axios.post(`http://localhost:8080/api/orders`, orderRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;

        switch (status) {
          case 400:
            throw new Error(`Bad Request: ${message}`);
          case 401:
            throw new Error('Unauthorized. Your session may have expired.');
          case 403:
            throw new Error('Forbidden. You don’t have permission to place this order.');
          case 404:
            throw new Error('Order service not found. Try again later.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Unexpected error (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error('No response from server. Check your internet connection.');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}
