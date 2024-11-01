import axios from "axios";
const options = {
    method: 'GET',
    url: 'https://wordsapiv1.p.rapidapi.com/words/lovely',
    headers: {
        'x-rapidapi-key': 'b990592d51msh5e1029396589d1bp18dd72jsnce5f8c3e8b6c',
        'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
    }
};
try {
    const response = await axios.request(options);
    console.log(response.data);
}
catch (error) {
    console.error(error);
}
//# sourceMappingURL=to-spanish.js.map