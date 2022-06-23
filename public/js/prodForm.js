//Instancio elemento del DOM que quiero manipular
const prodForm = document.querySelector('#prodForm')

//Tratamiento del submit de un nuevo producto al server
prodForm.addEventListener('submit', (e) => {
    
    e.preventDefault();
    let body = new FormData(prodForm)
    const prod = {
        title: body.get('productTitle'),
        price: parseFloat(body.get('productPrice')), //Necesario convertir a Number
        thumbnail: body.get('productImgUrl')
    }
    socket.emit(PRODMSG, prod);
    prodForm.reset()
})