const axios = require('axios');

async function test() {
    try {
        console.log("Sending request...");
        // Since we don't have token, we expect 401 Unauthorized but NOT hanging!
        const response = await axios.post('http://localhost:8000/api/v1/users/3/unlock');
        console.log(response.status, response.data);
    } catch (e) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", e.response?.data);
    }
}
test();
