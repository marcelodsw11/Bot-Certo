var socket = io("https://botlifeteam.herokuapp.com/music");

const fetchServerData = (dados) => {
    console.log(dados)
    let musicName = document.getElementById("music").innerHTML;
    if (musicName === dados.title) return;
    if(dados.title) {
        document.getElementById("music").innerHTML = `Tocando Agora: ${dados.title}`;
    }else {
        document.getElementById("music").innerHTML ="Tocando Agora: Sem músicas na fila"
    }
}
socket.on("newSong", data => {
    fetchServerData(data)
})
//http://localhost:5001/music
//https://botlifeteam.herokuapp.com/music