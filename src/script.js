//Default Values
var srcTestImage = 'testing/Ensaio de Feed 1.png';
var defaultNumColsToCut = 3;
var defaultNumRowsToCut = 4;

var slicer = {
  numColsToCut : defaultNumColsToCut,
  numRowsToCut : defaultNumRowsToCut,
}

//Elements

var fileInput = document.getElementById('inputImageToSlice');
var btnFatiar = document.getElementById('btnFatiar');
var btnDownload = document.getElementById('btnDownload');
var btnTeste = document.getElementById('btnTeste');

var eImagesWereInserted = new CustomEvent("imagesWereInserted", {
  "detail": "As imagens foram inseridas no DOM"
});


var ctx = document.getElementById('canvasImageToSlice').getContext('2d');
var image = new Image();
var imageSlices = [];


var widthOfSlice, numRowsToCut, numColsToCut, numRowsToCut;

//Event Listerners

fileInput.addEventListener('change', loadFile);
image.addEventListener('load', loadImage);
btnFatiar.addEventListener('click', calculateSliceParamenters);
btnFatiar.addEventListener('click', sliceImage);  
btnDownload.addEventListener('click', downloadImages);
btnTeste.addEventListener('click', loadDummyImage);

image.onload = function () {
  ctx.drawImage(image, 200, 200);
  console.log("Imagem carregada: " + this.width + '-' + this.height)
}

document.querySelectorAll('.processingButton').forEach(item => {
  item.addEventListener('click', btnSetToProcessing)
})

document.addEventListener("imagesWereInserted", function (e) {
  console.log(e.detail);
  btnReset(e);
});

//-----------------------------------------------------------------------------

function loadFile(e) {
  image.src = URL.createObjectURL(e.target.files[0]);
}

function loadDummyImage(e) {
  /**
   * Carrega uma imagem padrão no Canvas para motivos de teste
   */
  image.src = srcTestImage;
  sliceImage();
}

function loadImage(e) {
  calculateSliceParamenters();  
}


function sliceImage() {
  console.log('Fatiando Imagem');
  //elementEmpty("slicedElements");
  imageSlices = [];
  for (var x = 0; x < slicer.numColsToCut; x++) {
    for (var y = 0; y < slicer.numRowsToCut; y++) {
      var canvas = document.createElement('canvas');
      canvas.width = widthOfSlice;
      canvas.height = heightOfSlice;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, x * widthOfSlice, y * heightOfSlice, widthOfSlice, heightOfSlice, 0, 0, canvas.width, canvas.height);
      imageSlices.push(canvas.toDataURL());
    }
  }
  insertImage('slicedImage', imageSlices)
}



function downloadImages() {
  //base64toBlob(imageSlices[0],'png')
}


function insertImage(imgElement, imgURLs) {
  console.log('Inserindo Imagens');

  //Extremelly creative named variables
  var outputDiv = document.getElementById("slicedElements");
  var cols = slicer.numColsToCut;
  var rows = slicer.numRowsToCut;
  var imgs = imgURLs.length;

  for (var r = 0; r < rows; r++) {
    var newDivRow = document.createElement("div");
    newDivRow.setAttribute("class", "row");
    newDivRow.setAttribute("id", "row" + r);
    outputDiv.appendChild(newDivRow);
  }

  r = 0;
  for (var i = 0; i < imgs; i++) {
    var newDiv = document.createElement("div");
    var newImage = document.createElement("img");

    outputDiv = document.getElementById("row" + r);
    newDiv.setAttribute("class", "col-sm card img-slice");
    newImage.setAttribute('src', imgURLs[i]);
    newDiv.appendChild(newImage);

    outputDiv.appendChild(newDiv);
    r++;
    if (r == rows) {
      r = 0;
    }
  }
  document.dispatchEvent(eImagesWereInserted);
}

//UI and Auxiliary

function calculateSliceParamenters(){
  slicer.numColsToCut = isEmpty(document.getElementById('inputTxtCols').value) ? defaultNumColsToCut : document.getElementById('inputTxtCols').value;
  slicer.numRowsToCut = isEmpty(document.getElementById('inputTxtRows').value) ? defaultNumRowsToCut : document.getElementById('inputTxtRows').value;
  widthOfSlice = image.width / slicer.numColsToCut;
  heightOfSlice = image.height / slicer.numRowsToCut;
  printImageSettingsToUI({
    "Largura da Fatia":widthOfSlice,
    "Altura da Fatia":heightOfSlice,
    "Altura da Imagem":image.width,
    "Largura da Imagem":image.height,
    "Número de Colunas":slicer.numColsToCut,
    "Número de Linhas":slicer.numRowsToCut
  });
}

function printImageSettingsToUI(imgSettingsObj){
  console.log(imgSettingsObj);//Do pretty stuff instead
}

function btnSetToProcessing(e) {
  var newSpan = document.createElement("span");
  newSpan.setAttribute("class", "spinner-grow spinner-grow-sm");
  newSpan.setAttribute("role", "status");
  newSpan.setAttribute("aria-hidden", "sttrueatus");
  this.appendChild(newSpan);
}

function btnReset(e) {
  //Mockup of remove spinner thingy
  document.querySelectorAll('.spinner-grow').forEach(item => {
    //console.log("Found")
    //item.remove();
    //item.remove();
  })
}

function elementEmpty(elementID){
  /**Seta o conteúdo do elemento para em branco */
  document.getElementById(elementID).innerHTML = "";
}

function isEmpty(value){
  if( typeof value === 'undefined' ) {
    return true;
  }else{
    return false;
  }
}