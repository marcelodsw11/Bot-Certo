const fetchServerData = async() => {
    const dados = await axios.get("http://localhost:5001/music", {})
    console.log(dados)
    if(dados.data.title) {
        document.getElementById("music").innerHTML = `Tocando Agora: ${dados.data.title}`;
    }
    setTimeout(fetchServerData, 30000);
}
fetchServerData();