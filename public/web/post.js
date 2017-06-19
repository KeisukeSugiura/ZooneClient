$('ready', function(e){
  $.material.init();
  var sky = null;
  var url = null;
  var around = true;
  var swing = true;
  var rotation = true;
  var visible = true;
  var updated = false;

  const default_main = {
    color: "#777777",
    text: "",
    textColor: "#000000",
    size: 1,
    image: {}
  };
  var main = Object.assign({}, default_main);

  var preview = document.getElementById('preview')

  preview.innerHTML = document.getElementById('rcmnd_template').innerHTML;
  preview.querySelector('.cloud_text').style.fontSize = "50px";
  console.log(preview.querySelector('.cloud path'));
  preview.querySelector('.cloud path').setAttribute('style', `fill: url('#cloud-gradient'); filter: url('#cloud-filter');`)


  $("#text-color").spectrum({
    color: "black",
    flat: true,
    showInput: true,
    showInitial: true,
    showAlpha: true,
    clickoutFiresChange: true,
    cancelText: "cancel",
    chooseText: "OK",
    className: "text-color-btn",
    preferredFormat: "rgb",
    change: function(color){
      var c = color.toString()

      if(main.color_mode === 'text'){
        $('.input_text').css({color: c})
        main.textColor = c
      }
      else if(main.color_mode === 'cloud'){
        main.color = c;
        $('#cloud-gradient .stop2').css("stop-color", c);
      }
    }
  });

  // document.getElementById('text-property').querySelector('.text-color-btn').style.display = "none"
  document.getElementById('text-property').querySelector('.text-color-btn').style.border = "none"
  document.getElementById('text-property').querySelector('.text-color-btn').style.backgroundColor = "rgba(0,0,0,0)"

  $("#text-property").draggable();
  $("#cloud-property").draggable();
  $("#radio-option-text").on('change', function(){main.color_mode = "text"});
  $("#radio-option-cloud").on('change', function(){main.color_mode = "cloud"});

  $('.input_text').on('input', function(){main.text = this.innerText;})
  $('.cloud_text .input_text').on('focus', function(){
    $('.text-property').show();
  })
  $('.input_text').on("keydown", function(e) {
    if(e.keyCode === 13) {
      if(this.style.top.length > 0){this.style.top = parseInt(this.style.top) - 50 +'px';}
      else{this.style.top = parseInt(this.getBoundingClientRect().top) - 140 +'px';}
    }
  });
  $('.cloud').on('focus', function(){$('.text-property').toggle();})
  $('.translate-btn').click(function(){$('.property').hide()})

  $('.cloud_text').on('focus', function(){$('.cloud-property').show();})


  sky = new MickrSky({
    "elementID": "#sky",
    "client": true,
    "id": String(Math.random().toString(36).slice(-8)),
    "url": "ws://apps.wisdomweb.net:64260/ws/mik",
    "site": "test",
    "token": "Pad:9948"
  });

  $('#play-btn').on('click', function(){sky.addCloud(main)});
  $('#new-btn').on('click', function(){
    main = Object.assign({}, default_main);
    document.getElementById('preview').querySelector('.input_text').innerText = "";
    document.getElementById('preview').querySelector('.input_text').style.color = main.textColor;
    document.getElementById('preview').querySelector('.stop2').setAttribute("style", "stop-color: "+main.color+";");
    updated = true;
  });

  $('#upload-btn').click(function(){
    var tl = new TimelineLite()
    tl.add(TweenLite.to(document.getElementById('preview'), 1, {x: 0, y: 50, scale: 0.3}))
    tl.add(TweenLite.to(document.getElementById('preview'), 1.5, {x: 0, y: -800, onComplete: function(){
      sky.broadcast("mickr", {
        "body": {
          "content": main
        }
      }, function(req, res){
        console.log(req,res);
      });
      document.getElementById('preview').querySelector('.input_text').innerText = "";
      TweenLite.to(document.getElementById('preview'), 0, {x: 0, y: 0, scale:1.0})
      updated = true;
    }}))
  })

  var obj = $("#preview");
  obj.on('dragenter', function(e){
      e.stopPropagation();
      e.preventDefault();
      $(this).css('border', '2px solid #0B85A1');
  });
  obj.on('dragover', function(e){
   e.stopPropagation();
   e.preventDefault();
  });
  obj.on('drop', function(e){
     $(this).css('border', 'none');
     e.preventDefault();
     var files = e.originalEvent.dataTransfer.files;
     console.log(files);
     fileLoad(files)
  });

  function fileLoad(fileList){
    var fileReader = new FileReader() ;
    fileReader.onload = function(e) {
      console.log(e);
      var dataUri = this.result ;
      var cloud_image = document.getElementById("preview").querySelector('.cloud_image');
      cloud_image.src = dataUri;
      // main.image.name = file.name;
      main.image.url = dataUri;
    }
    fileReader.readAsDataURL(fileList[0]);
  }

  $(document).on('dragenter', function (e){
    e.stopPropagation();
    e.preventDefault();
  });
  $(document).on('dragover', function(e){
    e.stopPropagation();
    e.preventDefault();
    obj.css('border', '2px dotted #0B85A1');
  });
  $(document).on('drop', function (e){
    e.stopPropagation();
    e.preventDefault();
  });


  $('#myModal').modal()
  $('#submit').click(function(e){
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#myModal').modal('hide');

    // sky = new MickrSky({
    //   "elementID": "#sky",
    //   "client": true,
    //   "id": $('#ID').val() || String(Math.random().toString(36).slice(-8)),
    //   "url": "ws://apps.wisdomweb.net:64260/ws/mik",
    //   "site": $('#Site').val() || "test",
    //   "token": $('#Token').val() || "Pad:9948"
    // });

    // cloud.animator.animations['click'] = cloud.animator.animations['expand'];
    // cloud.animator.animations['clicked'] = cloud.animator.animations['zero'];

    $('#text').change(function(){
      cloud.setText($('#text').val(), '#'+$('#text-color').val());
    })

    $('#text-color').change(function(){
      cloud.setText($('#text').val(), '#'+$('#text-color').val());
    })

    $('#color').change(function(){
      cloud.setColor($('#color').val());
    })

    $("#img-file").change(function(e){
      var file = e.target.files[0];
      var reader = new FileReader()
      if(file.type.indexOf("image") < 0){return false;}
      reader.addEventListener('loadend', function(e){
        url = e.target.result;
        cloud.setImage(e.target.result)
      })
      reader.readAsDataURL(file)
    })

    $('#ch-around').change(function(){around = !around})
    $('#ch-swing').change(function(){swing = !swing})
    $('#ch-rotation').change(function(){rotation = !rotation})
    $('#ch-visible').change(function(){visible = !visible})

  })
})
