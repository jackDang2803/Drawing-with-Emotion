var leftBuffer;
var rightBuffer;

var socket;

let faceapi;
let detections = [];

let video;
let canvas;

let c; //colour 
let strokeW = 5; //stroke weight

function setup() {
    // 800 x 400 (double width to make room for each "sub-canvas")
    createCanvas(800,400);

    video = createCapture(VIDEO);
    video.size(400,400);
    video.position (0,0);
    video.hide();

    // Create both of your off-screen graphics buffers
    leftBuffer = createGraphics(400, 400);
    rightBuffer = createGraphics(400,400);

    const faceOptions = {
        withLandmarks: true,
        withExpressions: true,
        withDescriptors: true,
        minConfidence: 0.5
      };

    //Initialize faceapi model
    faceapi = ml5.faceApi(video, faceOptions, faceReady);

    //sending
    socket=io.connect('http://localhost:3000');
    socket.on('mouse', newDrawing);
}

function draw() {
    // Draw on your buffers however you like
    drawLeftBuffer();
    drawRightBuffer();
    // Paint the off-screen buffers onto the main canvas
    image(leftBuffer, 0, 0);
    image(rightBuffer, 400, 0);
}

function drawLeftBuffer() {
    // leftBuffer.background(255,255,255);
    leftBuffer.fill(0, 0, 0); //fill for text
    leftBuffer.textSize(32);
    leftBuffer.text("This is the left buffer!", 50, 50);
}

function drawRightBuffer() {
    // rightBuffer.background(255, 100, 255);
    rightBuffer.fill(0, 0, 0); //fill for text
    rightBuffer.textSize(32);
    rightBuffer.text("This is the right buffer!", 50, 50);
}


//face api 

function faceReady() {
    faceapi.detect(gotFaces);// detecting faces
  }

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections
  console.log(detections);

//   clear();//clear each frame
  fill(255,255,255);
  stroke(255,255,255);
  rect(0,0,400,400); //clearing frame

  drawLandmarks(detections);//// Draw all the face points
  drawExpressions(detections, 20, 250, 14);//Draw face expression

  faceapi.detect(gotFaces);// Call the function again at here

}


function drawLandmarks(detections){
    if (detections.length > 0) {//If at least 1 face is detected
      for (f=0; f < detections.length; f++){
        let points = detections[f].landmarks.positions;
        for (let i = 0; i < points.length; i++) {
          stroke(125, 125, 125); //grey frame
          strokeWeight(3);
          point(points[i]._x, points[i]._y);
        }
      }
    }
  }

  function drawExpressions(detections, x, y, textYSpace){
    if(detections.length > 0){//If at least 1 face is detected
      let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
      
      textFont('Helvetica Neue');
      textSize(14);
      noStroke();
      fill(44, 169, 225);
  
      text("neutral:       " + nf(neutral*100, 2, 2)+"%", x, y); 
      text("happiness: " + nf(happy*100, 2, 2)+"%", x, y+textYSpace);
      text("anger:        " + nf(angry*100, 2, 2)+"%", x, y+textYSpace*2);
      text("sad:            "+ nf(sad*100, 2, 2)+"%", x, y+textYSpace*3);
      text("disgusted: " + nf(disgusted*100, 2, 2)+"%", x, y+textYSpace*4);
      text("surprised:  " + nf(surprised*100, 2, 2)+"%", x, y+textYSpace*5);
      text("fear:           " + nf(fearful*100, 2, 2)+"%", x, y+textYSpace*6);
      
      maxExpression = Math.max(neutral, happy, angry, sad, disgusted, surprised, fearful);
      console.log("max :" + maxExpression);
      switch (maxExpression) {
        case neutral:
            // c = 'black';
            strokeW = 10;
            console.log("max exp. is neutral");
            break;
        case happy:
            // c = 'orange';
            strokeW = 20;
            console.log("max exp. is happy");
            break;
        case angry:
            // c = 'red';
            strokeW = 15;
            console.log("max exp. is angry");
            break;
        case sad:
            // c = 'grey';
            strokeW = 5;
            console.log("max exp. is sad");
            break;
        case surprised:
            // c = 'yellow';
            strokeW = 25;
            console.log("max exp. is surprised");
            break;
      }
      console.log("user: " + socket.id);
      // //color from drawexpression
      // if (neutral<0.5){
      //     c ='black'; //when you are neutral it is black 
      // }
      // else {
      //     c='red'
      // }
  
      // //assign colours from other
  
      //   console.log(neutral);
  
    }else{//If no faces is detected
      text("neutral: ", x, y);
      text("happiness: ", x, y + textYSpace);
      text("anger: ", x, y + textYSpace*2);
      text("sad: ", x, y + textYSpace*3);
      text("disgusted: ", x, y + textYSpace*4);
      text("surprised: ", x, y + textYSpace*5);
      text("fear: ", x, y + textYSpace*6);
  
    }
  }

  //DRAWING 
  //receive drawing from other user
function newDrawing (data){
    c = 'red';
    stroke(c);
    strokeWeight(0);
    //parse back data into data.x, data.y
    // line(data.x, data.y, data.x-1, data.y-1);
    ellipse(data.x,data.y,strokeW,strokeW);
    //try rect, or ellipse or circle 
  }
  
  function mouseDragged(){
    console.log('Sending: ' + mouseX + ',' + mouseY);

    var data = {
        x: mouseX, 
        y: mouseY
    }

    socket.emit('mouse', data);

    // background('green');
    c = 'red';
    stroke(c);
    strokeWeight(0);
    if (mouseIsPressed === true) {
      ellipse(mouseX,mouseY,strokeW,strokeW);
    //   line(mouseX, mouseY, pmouseX, pmouseY);
    }
  }