const PRODMSG = 'prod_msg' //Constante que seteo tanto del lado del server como del cliente ya que deben coincidir.

let prodList = [] //Acá llevo el array de productos actualizado

const socket = io(); //Me conecto mediante socket.io al server

//Recibo comunicación del socket informando update de Productos. Renderizo tabla.
socket.on(PRODMSG, (data) => {

    prodList = data

    if (document.querySelector('#tablaProd')) {
        renderProdList(data)
    }
})

function renderProdList(list) {

    const tablaProd = document.querySelector('#tablaProd')
    const tbody = document.querySelector('#tablaProd tbody')
    const noProd = document.querySelector('#noProd')

    if (list.length > 0) {
        tablaProd.style.display = 'block'
        noProd.style.display = 'none'
    } else {
        tablaProd.style.display = 'none'
        noProd.style.display = 'block'
    }
    tbody.innerHTML=''
    for (const p of list) {
        const item = document.createElement('tr');
        tbody.appendChild(item);
        //Compilo el html de un partial de hbs con la data del producto
        // item.outerHTML = Handlebars.compile('{{> tableRaw}}')({ producto: data })
        item.outerHTML = `
        <tr class="align-middle">
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$ ${p.price}</td>
            <td>
                <img style="height: 4rem" class="mh-100" src="${p.thumbnail}" alt="${p.title}" />
            </td>
        </tr>`
    }
}