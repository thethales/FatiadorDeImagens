//Default & Global Values
var srcTestImage = 'testing/Ensaio de Feed 1.png';
var defaultNumColsToCut = 3;
var defaultNumRowsToCut = 4;
var defaultOutputDivID = 'slicedElements';
var defaultWidthHeightTable = 'tabelaWidthHeight';   //Descreve o ID da tabela de Largura e Altura de cada fatia

var slicer = {
  file: {
    name : ""
  },
  numColsToCut: defaultNumColsToCut,
  numRowsToCut: defaultNumRowsToCut,
  resetSlicesColsRows: function () {
    this.numColsToCut = defaultNumColsToCut;
    this.numRowsToCut = defaultNumRowsToCut;
  },
  zip: {
    default_folder_name: 'imagens',
    default_zip_name: 'fatias.zip'
  }
}

var uiMsgList = {
  TooManyDamnColumns: "Atenção, um número de colunas ou linhas superior a 100 poderá gerar baixo desempenho ou travar a página. Você tem certeza que deseja prosseguir ?",
  NeedImageBeforeDownload: "É necessário selecionar e fatiar uma imagem antes de poder baixa-la"
}

//Elements

var fileInput   = document.getElementById('inputImageToSlice');
var colInput    = document.getElementById('inputTxtCols');
var rowInput    = document.getElementById('inputTxtRows');
var btnFatiar   = document.getElementById('btnFatiar');
var btnTeste    = document.getElementById('btnTeste');
var btnDownload = document.getElementById('btnDownload');
var dropArea           = document.getElementById('dropArea');
var slicedElementsArea = document.getElementById('slicedElements');
var containerSlicedElements = document.getElementById('containerSlicedElements');



var eImagesWereInserted = new CustomEvent("imagesWereInserted", {
  "detail": "As imagens foram inseridas no DOM"
});


var ctx = document.getElementById('canvasImageToSlice').getContext('2d');
var image = new Image();
var imageSlices = [];


var widthOfSlice, numRowsToCut, numColsToCut, numRowsToCut;

//Event Listerners

fileInput.addEventListener('change', loadFile);
colInput.addEventListener('change', printGrid);
rowInput.addEventListener('change', printGrid);
image.addEventListener('load', loadImage);
btnFatiar.addEventListener('click', calculateSliceParamenters);
btnFatiar.addEventListener('click', printGrid);
btnDownload.addEventListener('click', 
  function(){
    if(imageSlices.length > 0){                                  
      downloadImages(slicer.zip.default_zip_name,slicer.zip.default_folder_name);
    }else{
      uiMessage(10);
    }
  });
dropArea.addEventListener('drop', droppedImage, false);


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

//Handle Drag Area Events
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false)
})

;['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlightDropArea, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlightDropArea, false)
})

dropArea.addEventListener('drop', droppedImage, false);
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
  sliceImage();
}

function droppedImage(e){
  let dt = e.dataTransfer;
  image.src = URL.createObjectURL(dt.files[0]);
}

//-----------------------------------------------------------------------------

function sliceImage() {
  console.log('Fatiando Imagem');
  calculateSliceParamenters();
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

  insertImage(defaultOutputDivID, imageSlices)

}


function insertImage(outputDivId, imgURLs) {
  console.log('Inserindo Imagens');

  elementEmpty(outputDivId);

  //Extremelly creative named variables
  var outputDiv = document.getElementById(outputDivId);
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
    let newDiv = document.createElement("div");
    let newImage = document.createElement("img");
    let newSpan = document.createElement("span");

    outputDiv = document.getElementById("row" + r);
    newDiv.setAttribute("class", "col-sm card img-slice");
    newImage.setAttribute('src', imgURLs[i]);
    newImage.setAttribute('name', i);
    newSpan.innerText = i;
    newDiv.appendChild(newImage);
    newDiv.appendChild(newSpan);
    outputDiv.appendChild(newDiv);
    r++;
    if (r == rows) {
      r = 0;
    }
  }
  document.dispatchEvent(eImagesWereInserted);
}


function downloadImages(zipName,slicesFolderName){
  /**
   * Gera e gatilha o download de um arquivo ZIP contendo todas as imagens
   * @param {string} zipName Nome do arquivo ZIP
   * @param {string} slicesFolderName Nome pasta contendo arquivos fatiados
   */

  zipName = isEmpty(zipName) ? 'fatias.zip' : zipName;
  slicesFolderName = isEmpty(slicesFolderName) ? 'fatias' : slicesFolderName;

  var zip = new JSZip();
  var img = zip.folder(slicesFolderName);
  for(var i=0; i<imageSlices.length; i++){
    let imgData = imageSlices[i];
        imgData = imgData.replace(/^data:image\/(png|jpg|gif|jpeg|webp);base64,/, "");

    let imgName = "fatia" + i + base64ContentFileFormatIndex(imgData);
    img.file(imgName, imgData , {base64: true});

  }
  zip.generateAsync({type:"blob"})
  .then(function(content) {
      saveAs(content, zipName);// see FileSaver.js
  });
}

//--UI--------------------------------------------------------------------------- 

function printGrid() {
  printWidthHeightTable();  
  if (image.src == "") {
    printGridMockup();
  } else {
    sliceImage();
  }
}

function calculateSliceParamenters() {

  let numCols = isEmpty(document.getElementById('inputTxtCols').value) ? defaultNumColsToCut : document.getElementById('inputTxtCols').value;
  let numRows = isEmpty(document.getElementById('inputTxtRows').value) ? defaultNumRowsToCut : document.getElementById('inputTxtRows').value;

  slicer.numColsToCut = numCols;
  slicer.numRowsToCut = numRows;

  //Move this part to object 
  if (numCols == 0) {
    slicer.numColsToCut = 1;
  }
  if (numRows == 0) {
    slicer.numRowsToCut = 1;
  }

  if ((numCols >= 100 || numRows >= 100)) {
    let userConfirmation = confirm(uiMsgList.TooManyDamnColumns);
    if (!userConfirmation) {
      slicer.resetSlicesColsRows();
    }
  }

 

  widthOfSlice = image.width / slicer.numColsToCut;
  heightOfSlice = image.height / slicer.numRowsToCut;
  


  printImageSettingsToUI({
    "Largura da Fatia": widthOfSlice,
    "Altura da Fatia": heightOfSlice,
    "Altura da Imagem": image.width,
    "Largura da Imagem": image.height,
    "Número de Colunas": slicer.numColsToCut,
    "Número de Linhas": slicer.numRowsToCut
  });
}

function printImageSettingsToUI(imgSettingsObj) {
  console.log(imgSettingsObj); //Do pretty stuff instead
}

function printWidthHeightTable(){
  /**
   * Gera uma tabela de Inputs para preenchimento e customização de largura e altura
   */
  //if(defaultWidthHeightTable){
    let outputTable = document.getElementById(defaultWidthHeightTable);
    let cols = slicer.numColsToCut;
    let rows = slicer.numRowsToCut;
    let slices = cols * rows;

    elementEmpty(defaultWidthHeightTable);

    for (var r = 0; r <= rows; r++) {
      let newDivRow = document.createElement("div");
      newDivRow.setAttribute("class", "row");
      newDivRow.setAttribute("id", "tableRow" + r);
      outputTable.appendChild(newDivRow);
    }

    let rw = 0;
    for (var i = 0; i < slices; ++i) {
      let newDiv = document.createElement("div");
      let newInputSliceHeight = document.createElement("input");
      let newInputSliceWidth = document.createElement("input");
      let newSpan = document.createElement("span");

      outputTable = document.getElementById("tableRow" + rw);
      newDiv.setAttribute("class", "col-sm");
      newInputSliceHeight.setAttribute("class","input-sm slice-input");
      newInputSliceWidth.setAttribute("class","input-sm slice-input");
      newSpan.innerText = i;
      newDiv.appendChild(newSpan);
      newDiv.appendChild(newInputSliceWidth);
      newDiv.appendChild(newInputSliceHeight);
      outputTable.appendChild(newDiv);
      rw++;
      if (rw == rows) {
        rw = 0;
      }
    }

  //}
  
}

function printGridMockup() {
  calculateSliceParamenters();
  elementEmpty(defaultOutputDivID);
  let outputDiv = document.getElementById(defaultOutputDivID);
  let cols = slicer.numColsToCut;
  let rows = slicer.numRowsToCut;
  let slices = cols * rows;
  let sliceWidth = (outputDiv.offsetWidth /cols)+'px';

  for (var r = 0; r < rows; r++) {
    let newDivRow = document.createElement("div");
    newDivRow.setAttribute("class", "row");
    newDivRow.setAttribute("id", "row" + r);
    outputDiv.appendChild(newDivRow);
  }

  r = 0;
  for (var i = 0; i < slices; i++) {
    let newDiv = document.createElement("div");
    let newSpan = document.createElement("span");

    outputDiv = document.getElementById("row" + r);
    newDiv.setAttribute("class", "col-sm card img-slice-placeholder");
    newDiv.style["width"] = sliceWidth;
    newDiv.style["height"] = sliceWidth;
    newSpan.innerText = i;
    newDiv.appendChild(newSpan);
    outputDiv.appendChild(newDiv);
    r++;
    if (r == rows) {
      r = 0;
    }
  }

}

function btnSetToProcessing(e) {
  //var newSpan = document.createElement("span");
  //newSpan.setAttribute("class", "spinner-grow spinner-grow-sm");
  //newSpan.setAttribute("role", "status");
  //newSpan.setAttribute("aria-hidden", "sttrueatus");
  //this.appendChild(newSpan);
}

function btnReset(e) {
  //Mockup of remove spinner thingy
  document.querySelectorAll('.spinner-grow').forEach(item => {
    //console.log("Found")
    //item.remove();
    //item.remove();
  })
}

function highlightDropArea(e) {
  containerSlicedElements.classList.add('highlight')
}

function unhighlightDropArea(e) {
  containerSlicedElements.classList.remove('highlight')
}

function uiMessage(event){
  /**
   * Gerencia mensagens de Tela
   * @param {integer} event - Código do Evento de Messageria
   * @return {object}
   */

   switch(event){
     case 10:
       alert(uiMsgList.NeedImageBeforeDownload);
       return null;
      break;
   }

 }

// Auxiliares

function elementEmpty(elementID) {
  /**Seta o conteúdo do elemento para em branco */
  document.getElementById(elementID).innerHTML = "";
}

function isEmpty(value) {
  if (typeof value === 'undefined' || value == "") {
    return true;
  } else {
    return false;
  }
}

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}


function base64ContentFileFormatIndex(base64content){
  /**
   * Return the file type, based on the heading character on the base64 content that is not the complete URI
   * @param {string} base64content - The imcomplete URI, corresponds only to the base64 content
   * @return {string} - Returns a dot concatenated with the file extension
   * 
   * Based on: https://stackoverflow.com/questions/27886677/javascript-get-extension-from-base64-image
   */
  switch(base64content[0]){
    case '/' :
      return '.jpg';
    case 'i' :
        return '.png';
    case 'R' :
      return '.gif';
    case 'U' :
      return '.webp';
    default:
      return 'extension';
  }

}

// -------------------------------------------------------



