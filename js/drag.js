$(document).ready(function() {
    var drawLine = false;
    var theCanvas = document.getElementById('map');
    var finalPos = {x:0, y:0};
    var startPos = {x:0, y:0};
    var ctx = theCanvas.getContext('2d');
    var leftElements= [], rightElements= [], storeLines= [];
    var canvasOffset = $("#map").offset();
    var addedLeft= false;
    var addedRight= false;
    //kullanıcı için
    //font bilgileri
    var fontSize= 20;
    var fontFamily= "Arial";
    var circleColor= "#000000";
    var fontColor= "#000000";
    //buton sayıları ve pozisyonları
    var leftButtons=5;
    var rightButtons= 5;
    var buttonDistance= fontSize+100;
    var leftMargin= fontSize+16;
    var topMargin= fontSize;
    //çıbık propertileri
    var twoLeft= true;
    var twoRight= true;
    var lineThickness= 3;
    var lineColor= "#000000";
    //user input
    var leftText= "";
    var rightText= "";
    //canvas
    var canvasSize= {width: 0, height: 0};
    var userTwoLeftSide="a";
    var userTwoRightSide="b";
    //result
    var result= {};

    /*
    //çiz
    theCanvas.width = canvasWidth();
    theCanvas.height = canvasHeight();
    addText(ctx);
    */

    JFCustomWidget.subscribe("ready", function(){
        //parametreleri al
        fontSize = parseInt(JFCustomWidget.getWidgetSetting('userFontSize'));
        if(fontSize<10){
            fontSize= 10;
        }
        leftButtons = parseInt(JFCustomWidget.getWidgetSetting('userLeftButtonNum'));
        if(leftButtons<=0){
            leftButtons=1;
        }
        rightButtons = parseInt(JFCustomWidget.getWidgetSetting('userRightButtonNum'));
        if(rightButtons<=0){
            rightButtons=1;
        }
        leftText= JFCustomWidget.getWidgetSetting('userLeftSideText').split("\n");
        var num= 0;
        while(num!=leftButtons) {
            if (leftText[num] === undefined) {
                leftText[num] = num + 1;
            }
            num++;
        }
        rightText= JFCustomWidget.getWidgetSetting('userRightSideText').split("\n");
        num=0;
        while(num!=rightButtons) {
            if (rightText[num] === undefined) {
                rightText[num] = num + 1;
            }
            num++;
        }
        userTwoLeftSide= JFCustomWidget.getWidgetSetting('userTwoLeft');
        if(userTwoLeftSide=="No"){
            twoLeft= false;
        }
        else{
            twoLeft= true;
        }
        userTwoRightSide= JFCustomWidget.getWidgetSetting('userTwoRight');
        if(userTwoRightSide=="No"){
            twoRight= false;
        }
        else{
            twoRight= true;
        }
        lineThickness= parseInt(JFCustomWidget.getWidgetSetting('userLineThickness'));
        if(lineThickness>(fontSize/2)){
            lineThickness= fontSize/2;
        }
        else if(lineThickness<=0){
            lineThickness= 1;
        }
        buttonDistance= parseInt(JFCustomWidget.getWidgetSetting('userButtonDistance'));
        if(buttonDistance<100){
            buttonDistance=100;
        }
        fontFamily= JFCustomWidget.getWidgetSetting('userFontFamily');
        fontColor= JFCustomWidget.getWidgetSetting('userFontColor');
        circleColor= JFCustomWidget.getWidgetSetting('userCircleColor');
        lineColor= JFCustomWidget.getWidgetSetting('userLineColor');

        leftMargin= maxLeftLength(ctx);

        //çiz
        theCanvas.width = canvasWidth();
        theCanvas.height = canvasHeight();
        var canWidth= canvasWidth()+((canvasOffset.left)*2);
        var canHeight= canvasHeight()+((canvasOffset.top)*2)+50;
        canvasSize= {width: canWidth, height: canHeight};
        JFCustomWidget.requestFrameResize(canvasSize);
        addText(ctx);
     });

    JFCustomWidget.subscribe("submit", function() {
        var result = {value:"", valid: false};

        var i= 0;
        var j = 0;
        var temp;
        for(i=0; i<storeLines.length-1; i++) {
            for (j=0; j<storeLines.length-i-1; j++) {
                if (storeLines[j].c1.y > storeLines[j+1].c1.y) {
                    temp = storeLines[j];
                    storeLines[j] = storeLines[j+1];
                    storeLines[j+1] = temp;
                }
            }
        }

        i=0;
        while(storeLines.length>i){
            var x1= storeLines[i].c1.x, y1= storeLines[i].c1.y;
            var x2= storeLines[i].c2.x, y2= storeLines[i].c2.y;
            if (hoverLeft(x1, y1) != -1 && hoverRight(x2, y2) != -1) {
                //this part will be used if your field is required. If your widget is required valid
                //property will be expected before form can be submitted
                result.value= result.value + leftText[hoverLeft(x1, y1)] +" → "+ rightText[hoverRight(x2, y2)]+"\n";
                result.valid = true;
            }
            i++;
        }
        //this is your field result. You are expected to send value property as string
        //result.value = "my precious data"
        //most probably you will call sendSubmit method
        JFCustomWidget.sendSubmit(result);
    });

    //canvas
    function canvasHeight(){
        var maxHeight=0;
        if(leftButtons>=rightButtons){
            maxHeight= leftButtons;
        }
        else{
            maxHeight= rightButtons;
        }

        return (fontSize*maxHeight)+topMargin;
    }

    function canvasWidth() {
        var maxLeft= maxLeftLength(ctx);
        var maxRight= maxRightLength(ctx);
        return maxLeft+maxRight+buttonDistance;
    }

    //text
    function addText(cnvs) {
        addLeftText(cnvs);
        addRightText(cnvs);
    }

    //maxTextLength
    function maxLeftLength(cnvs) {
        cnvs.font= fontSize+"px "+fontFamily;
        var num=0;
        var maxLeft=0;
        while(num!=leftButtons) {
            if(cnvs.measureText(leftText[num]).width+((fontSize/4)*7/4)>maxLeft){
                maxLeft= cnvs.measureText(leftText[num]).width+((fontSize/4)*7/4);
            }
            num++;
        }
        return maxLeft;
    }

    function maxRightLength(cnvs){
        cnvs.font= fontSize+"px "+fontFamily;
        var num=0;
        var maxRight=0;
        while(num!=rightButtons) {
            if(cnvs.measureText(rightText[num]).width+((fontSize/4)*7/4)>maxRight){
                maxRight= cnvs.measureText(rightText[num]).width+((fontSize/4)*7/4);
            }
            num++;
        }
        return maxRight;
    }

    //draw
    function drawLeftSide (cnvs, x, y, radius, num) {
        cnvs.font= fontSize+"px "+fontFamily;
        cnvs.fillStyle = fontColor;
        var textLength= cnvs.measureText(leftText[num]).width;
        cnvs.fillText(leftText[num], x-(textLength+(leftElements[num].radius*7/4)), y+(leftElements[num].radius*5/4));
        cnvs.beginPath();
        cnvs.strokeStyle= circleColor;
        cnvs.lineWidth = 1;
        cnvs.arc(x,y,radius,0,2*Math.PI);
        cnvs.stroke();
    }

    function addLeftText(cnvs) {
        var num= 0;
        while(num!=leftButtons) {
            if(!addedLeft) {
                leftElements.push(new Circle(leftMargin, topMargin + fontSize * num, fontSize / 4));
            }
            drawLeftSide(cnvs, leftElements[num].x, leftElements[num].y, leftElements[num].radius, num);
            num++;
        }
        addedLeft= true;
    }

    function drawRightSide (cnvs, x, y, radius, num) {
        cnvs.font= fontSize+"px "+fontFamily;
        cnvs.fillStyle = fontColor;
        cnvs.fillText(rightText[num], x+(rightElements[num].radius*7/4), y+(rightElements[num].radius*5/4));
        cnvs.beginPath();
        cnvs.strokeStyle= circleColor;
        cnvs.lineWidth = 1;
        cnvs.arc(x,y,radius,0,2*Math.PI);
        cnvs.stroke();
    }

    function addRightText(cnvs) {
        var num= 0;
        while(num!=rightButtons) {
            if(!addedRight) {
                rightElements.push(new Circle(leftMargin + buttonDistance, topMargin + fontSize * num, fontSize / 4));
            }
            drawRightSide(cnvs, rightElements[num].x, rightElements[num].y, rightElements[num].radius, num);
            num++;
        }
        addedRight= true;
    }

    //line
    function line(cnvs) {
        cnvs.beginPath();
        cnvs.strokeStyle = lineColor;
        cnvs.lineWidth = lineThickness;
        cnvs.lineCap = 'round';
        cnvs.moveTo(startPos.x, startPos.y);
        cnvs.lineTo(finalPos.x, finalPos.y);
        cnvs.stroke();
    }

    //hover
    function hoverRight(mX, mY) {
        var currentPos = {x: mX, y: mY};
        var x1, y1;
        var x2= currentPos.x;
        var y2= currentPos.y;

        for(i=0; i<rightElements.length; i++){
            x1= rightElements[i].x;
            y1= rightElements[i].y;
            if(Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) )<= rightElements[i].radius){
                return i;
            }
        }
        return -1;
    }

    function hoverLeft(mX, mY) {
        var currentPos = {x: mX, y: mY};
        var x1, y1;
        var x2= currentPos.x;
        var y2= currentPos.y;

        for(i=0; i<leftElements.length; i++){
            x1= leftElements[i].x;
            y1= leftElements[i].y;
            if(Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))<= leftElements[i].radius){
                return i;
            }
        }
        return -1;
    }

    //return val
    /*
    function returnVal(left,right){
        return "<p>"+left+"->"+right+"</p>";
    }

    $("#resultButton").click(function (){
        var i= 0;

        $( "p:contains('->')" ).remove();

        while(storeLines.length>i){
            var x1= storeLines[i].c1.x, y1= storeLines[i].c1.y;
            var x2= storeLines[i].c2.x, y2= storeLines[i].c2.y;
            if (hoverLeft(x1, y1) != -1 && hoverRight(x2, y2) != -1) {
                //$("#result").before(returnVal(leftText[hoverLeft(x1, y1)], rightText[hoverRight(x2, y2)]));
                returnVal(leftText[hoverLeft(x1, y1)], rightText[hoverRight(x2, y2)]);
            }
            i++;
        }
    });
    */

    //clear
    function clearCanvas() {
        ctx.clearRect(0, 0, theCanvas.width, theCanvas.height);
        for(i=0; i<storeLines.length; i++){
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineThickness;
            ctx.lineCap = 'round';
            ctx.moveTo(storeLines[i].c1.x, storeLines[i].c1.y);
            ctx.lineTo(storeLines[i].c2.x, storeLines[i].c2.y);
            ctx.stroke();
        }
        addText(ctx);
    }

    //mouse events
    $("#map").mousemove(function(e) {
        if (drawLine === true) {
            finalPos = {x: e.pageX - canvasOffset.left, y: e.pageY - canvasOffset.top};
            clearCanvas();
            line(ctx);
            //ctx.fillText("current coor: x-"+currentCoor.x +" y-" + currentCoor.y, 25, 100);
        }
    });

    $("#map").mousedown(function(e) {
        //ctx.fillText(userTwoLeftSide,100,100);
        var currentCoor = {x: e.pageX - canvasOffset.left, y: e.pageY - canvasOffset.top};
        if(hoverLeft(currentCoor.x, currentCoor.y)!= -1) {
            drawLine = true;
            startPos = {x: e.pageX - canvasOffset.left, y: e.pageY - canvasOffset.top};
        }
    });

    $(window).mouseup(function() {
        clearCanvas();
        var overlay= false;
        if(hoverRight(finalPos.x, finalPos.y)!= -1){
            //daireleri ortala
            startPos.x = leftElements[hoverLeft(startPos.x, startPos.y)].x;
            startPos.y = leftElements[hoverLeft(startPos.x, startPos.y)].y;
            finalPos.x = rightElements[hoverRight(finalPos.x, finalPos.y)].x;
            finalPos.y = rightElements[hoverRight(finalPos.x, finalPos.y)].y;

            //cevap türleri
            if(twoLeft && twoRight) {
                for (var i = 0; i < storeLines.length; i++) {
                    if (storeLines[i].c1.x == startPos.x && storeLines[i].c1.y == startPos.y && storeLines[i].c2.x == finalPos.x && storeLines[i].c2.y == finalPos.y) {
                        overlay = true;
                    }
                }
            }
            else if(!twoLeft && twoRight){
                for (var i = 0; i < storeLines.length; i++) {
                    if (storeLines[i].c1.x == startPos.x && storeLines[i].c1.y == startPos.y) {
                        overlay = true;
                    }
                }
            }
            else if(twoLeft && !twoRight){
                for (var i = 0; i < storeLines.length; i++) {
                    if (storeLines[i].c2.x == finalPos.x && storeLines[i].c2.y == finalPos.y) {
                        overlay = true;
                    }
                }
            }
            else{
                for (var i = 0; i < storeLines.length; i++) {
                    if (storeLines[i].c1.x == startPos.x && storeLines[i].c1.y == startPos.y) {
                        overlay = true;
                    }
                    if (storeLines[i].c2.x == finalPos.x && storeLines[i].c2.y == finalPos.y) {
                        overlay = true;
                    }
                }
            }

            if (!overlay) {
                //çizilen çizgileri kaydedip çizgiyi çiz
                storeLines.push(new Line(startPos, finalPos));
                line(ctx);
            }
        }
        //pozisyonu sıfırla
        finalPos = {x:0, y:0};
        startPos = {x:0, y:0};
        drawLine = false;
    });

    //temizle butonu
    $("#clear").click(function () {
        while(storeLines.length!=0){
            storeLines.pop();
        }
        console.log($("#clear").outerWidth()+" "+$("#undo").outerWidth());
        clearCanvas();
    });

    //geri al butonu
    $("#undo").click(function(){
        if(storeLines.length!=0){
            storeLines.pop();
        }
        clearCanvas();
    });
});

