const fetchServerData = async() => {
    const dados = await axios.get("https://botlifeteam.herokuapp.com/music", {})
    if(dados.data.title) {
        document.getElementById("music").innerHTML = `Tocando Agora: ${dados.data.title}`;
    }else {
        document.getElementById("music").innerHTML ="Tocando Agora: Sem músicas na fila"
    }
    setTimeout(fetchServerData, 30000);
}
fetchServerData();
//http://localhost:5001/music
//https://botlifeteam.herokuapp.com/music