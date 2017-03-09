(function($) {

    /*var c = document.getElementById('v')
    var ctxx = c.getContext('2d')*/

    $('document').ready(function() {
        console.log('BalsaudioPlayer is ready !')

        var audio         = $('#audio')[0]

        var audioContext  = new AudioContext
        var audioSrc      = audioContext.createMediaElementSource(audio)
        var audioAnalyser = audioContext.createAnalyser()
        audioSrc.connect(audioContext.destination)
        audioSrc.connect(audioAnalyser)
        var frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)

        var player        = $('.player')

        var soundDrawer   = player.find('.player__visualizer')[0].getContext('2d')
        var drawerId      = null
        var soundTitle    = player.find('.player__title')
        var volume        = player.find('.player__volume')
        var header        = player.find('.player__header')

        var progress      = player.find('.player__progress')
        var currentTime   = progress.find('.progress__current')
        var totalTime     = progress.find('.progress__total')
        var barTime       = progress.find('.progress__bar')
        var barCursor     = barTime.find('.cursor')

        var controls      = player.find('.player__controls')
        var mode          = controls.find('.controls__mode')
        var prev          = controls.find('.controls__prev')
        var loop          = controls.find('.controls__loop')
        var volume_plus   = controls.find('.controls__volume-plus')
        var volume_less   = controls.find('.controls__volume-less')

        var mousedown     = false

        var parseTime     = function(time) {
            var h   = ('0' + parseInt(time / (60 * 60))).slice(-2)
            time %= 60 * 60

            var m   = ('0' + parseInt(time / 60)).slice(-2)
            time %= 60

            var s   = ('0' + parseInt(time)).slice(-2)

            var res = []

            if (h !== '00') {
                res.push(h)
            }

            res.push(m, s)

            return res.join(':')
        }

        var drawSound     = function() {
            drawerId = requestAnimationFrame(drawSound)

            audioAnalyser.getByteFrequencyData(frequencyData)

            var height = soundDrawer.canvas.height
            var width  = soundDrawer.canvas.width

            soundDrawer.clearRect(0, 0, width, height)

            for (var i = 0; i < width / 5; i++) {
                soundDrawer.fillStyle = '#4CAF50'
                soundDrawer.fillRect(
                    i * 5,
                    height - (frequencyData[i] / 255 * height),
                    5,
                    frequencyData[i] / 255 * height
                )
            }
        }

        mode.on('click', function(event) {
            event.preventDefault()

            var elem = $(this)

            if (elem.hasClass('play')) {
                elem.removeClass('play')
                elem.addClass('pause')
                audio.play()
                drawSound()
            } else {
                elem.removeClass('pause')
                elem.addClass('play')
                audio.pause()
            }
        })

        prev.on('click', function(event) {
            event.preventDefault()

            if (!audio.paused) {
                audio.currentTime = 0
            }
        })

        prev.on('dblclick', function(event) {
            event.preventDefault()

            console.log('prev')
        })

        loop.on('click', function(event) {
            event.preventDefault()

            var elem = $(this)

            if (elem.hasClass('active')) {
                elem.removeClass('active')
                $(audio).removeAttr('loop')
            } else {
                elem.addClass('active')
                $(audio).attr('loop', 'loop')
            }
        })

        volume_plus.on('click', function(event) {
            event.preventDefault()

            var tmpVolume = parseInt(volume.attr('class').split('-')[1])

            if (tmpVolume < 3) {
                volume.removeClass('volume-' + tmpVolume)

                tmpVolume++
                volume.addClass('volume-' + tmpVolume )

                audio.volume = tmpVolume / 3
            }
        })

        volume_less.on('click', function(event) {
            event.preventDefault()

            var tmpVolume = parseInt(volume.attr('class').split('-')[1])

            if (tmpVolume > 0) {
                volume.removeClass('volume-' + tmpVolume)

                tmpVolume--
                volume.addClass('volume-' + tmpVolume)

                audio.volume = tmpVolume / 3
            }
        })

        header.on('mousewheel', function(event) {
            event.preventDefault()

            if (Math.sign(event.originalEvent.wheelDelta) > 0) {
                volume_plus.trigger('click')
            } else {
                volume_less.trigger('click')
            }
        })

        barCursor.on('mousedown', function() {
            mousedown = true
        })

        progress.on('mousewheel', function(event) {
            event.preventDefault()

            audio.currentTime += Math.sign(event.originalEvent.wheelDelta)
        })

        $(document).on('mouseup', function() {
            mousedown = false
        })

        $(document).on('mousemove', function(event) {
            if (!mousedown) {
                return
            }
        })

        $(window).on('dragenter dragover', function(event) {
            event.preventDefault()
        })

        $(window).on('drop', function(event) {
            event.preventDefault()

            console.log(event.originalEvent.dataTransfer.getData('text/html'))
        })

        audio.addEventListener('loadedmetadata', function() {
            console.log('Meta data are loaded')

            totalTime.text(parseTime(this.duration))
            soundTitle.text(this.src.split('\\').pop().split('/').pop().replace(new RegExp('%20', 'g'), ' '))
        })

        $(audio).on('timeupdate', function() {
            var time    = this.currentTime
            var total   = this.duration
            var percent = time / total * 100

            currentTime.text(parseTime(time))
            barTime.find('.bar').css('width', percent + '%')
            barTime.find('.cursor').css('left', percent + '%')
        })

        $(audio).on('ended', function() {
            mode.removeClass('pause')
            mode.addClass('play')
            audio.pause()
        })

        /*var audio = $('#audio')
        audio[0].play()

        audio.on('loadedmetadata', function(event) {
            console.log('Meta data are loaded')

            var a = document.getElementById('audio')
            var ctx = new AudioContext
            var audioSrc = ctx.createMediaElementSource(a)
            var analyser = ctx.createAnalyser()

            audioSrc.connect(ctx.destination)

            audioSrc.connect(analyser)

            var frequencyData = new Uint8Array(analyser.frequencyBinCount)

            function renderFrame() {
                requestAnimationFrame(renderFrame)
                analyser.getByteFrequencyData(frequencyData)

                ctxx.clearRect(0, 0, 300, 50)
                ctxx.beginPath()
                ctxx.moveTo(0, 25)


                for (var i = 0; i < 30; i++) {
                    var r = 0

                    for (var j = 0; j < Math.floor(frequencyData.length / 60); j++) {
                        r += frequencyData[i * j]
                    }

                    r /= Math.floor(frequencyData.length / 60)
                    var h = frequencyData[i] / 255 * 50
                    var t = 50 - h


                    ctxx.fillRect(i * 10, t, 10, h)
                    //ctxx.lineTo(i * 5, 25 + t - 25)
                }

                ctxx.lineTo(300, 25)
                ctxx.stroke()
                ctxx.closePath()


                /*for (var i = 0; i < 60; i++) {
                    var c = frequencyData[i]
                    var h = c / 255 * 200
                    var t = 200 - h
                    var r = []

                    for (var j = 0; j < Math.floor(frequencyData.length / 60); j++) {
                        r.push(frequencyData[j])
                    }



                    ctxx.fillRect(i * 5, t, 5, h)
                }*/
            /*}

            renderFrame()
        })*/
    })

})(jQuery)
