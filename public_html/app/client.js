/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

var files = {};

function previewImg() {
    let uploadImg = document.getElementById('uploadImg');
    const [file] = uploadImg.files;
    if (file) {
        files += file;
        console.log(file);
        console.log(files);
        let current = document.getElementById("previewPhotos");
        let oldHTML = current.innerHTML;
        let newHTML = '<img class="createPostImgs" src="' + URL.createObjectURL(file) + '" alt="Your Image"></img>';
        current.innerHTML = newHTML + oldHTML;
    }
}