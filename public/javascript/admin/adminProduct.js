

document.addEventListener('DOMContentLoaded', function() { 
    document.querySelectorAll('.product-row').forEach((row) => {
        row.addEventListener('dblclick', (event) => {
            console.log('comes here')
           try {
             let targetId = event.currentTarget.dataset.target
             console.log(targetId)
            window.location.href = `/api/v1/admin/products/product-detail?id=${targetId}`
           } catch (error) {
            console.log(error)
            
           }
        })
    })
})







function listProduct(id, title, isListed) {
    const data = {
        id: id
    }
    let status = isListed ? 'Unlist' : 'List'

    Swal.fire({

        text: `Do you want to ${status} ${title}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '3085d6',
        cancelButtonColor: 'd33',
        confirmButtonText: 'Yes'

    })
        .then((response) => {
            if (response.isConfirmed) {

                $.ajax({
                    type: 'put',
                    url: '/api/v1/admin/products/list-product',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    success: (response) => {
                        if (response.ok) {
                            $('#Reload').load('/api/v1/admin/products #Reload');
                            Swal.fire({
                                title: `${status}ed!`,
                                icon: 'success',
                                text: `Successfully ${status}ed ${title}`,
                                times: 1500,

                            })
                        }
                    }
                })



            }
        })


}



function Delete(id, title) {
    const data = { id: id }
    Swal.fire({
        title: "Are you sure!",
        text: `Do you want to delete ${title}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '3085d6',
        cancelButtonColor: 'd33',
        confirmButtonText: 'Yes'

    })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'delete',
                    url: '/api/v1/admin/products/delete-product',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    success: (response) => {
                        if (response.ok) {
                            $('#Reload').load('/api/v1/admin/products #Reload', () => {
                                Swal.fire({
                                    title: 'Deleted!',
                                    icon: 'success',
                                    text: 'Successfully deleted!',
                                    times: 1500,
                                })
                            })
                        }

                    }



                })
            }
        })


}