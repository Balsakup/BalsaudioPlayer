(function($) {

    $(document).ready(function() {

        console.log('Audio player is ready !')

        // Audio
        var audio            = $('#player')
        var musics           = []

        // Player
        var player           = $('.player')

        // Metas
        var cover            = $('.header__cover')
        var author           = $('.header__author')
        var title            = $('.header__title')

        // Progress
        var progress         = player.find('.player__progress')
        var progress_current = progress.find('.progress__current')
        var progress_total   = progress.find('.progress__total')
        var progress_buffer  = progress.find('.buffer')
        var progress_bar     = progress.find('.bar')
        var progress_cursor  = progress.find('.cursor')
        var drag_cursor      = false

        // Controls
        var controls         = $('.player__controls')
        var controls_loop    = controls.find('.controls__loop')
        var controls_random  = controls.find('.controls__random')
        var controls_prev    = controls.find('.controls__prev')
        var controls_mode    = controls.find('.controls__mode')
        var controls_next    = controls.find('.controls__next')

        // Volume
        var volume           = $('.controls__volume input[type="range"]')

        // Playlist
        var playlist         = $('.player__playlist')

        // Analyser
        var audioContext     = new AudioContext
        var audioSrc         = audioContext.createMediaElementSource(audio[0])
        var audioAnalyser    = audioContext.createAnalyser()
        audioSrc.connect(audioContext.destination)
        audioSrc.connect(audioAnalyser)
        var frenquencyData   = new Uint8Array(audioAnalyser.frequencyBinCount)

        // Sound drawer
        var soundDrawer      = $('.header__drawer')
        var soundDrawerCtx   = soundDrawer[0].getContext('2d')
        soundDrawer.attr('width', $('.player__header').width())
        soundDrawer.attr('height', $('.player__header').height())

        // Utils
        var parseTime        = function(time) {
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

        var play             = function(index = 0, autoplay = true) {
            index = index < 0 ? musics.length + index : index % musics.length
            var music = musics[index]

            audio.attr('src', music.file)
            audio.attr('data-index', index)

            author.text(music.author)

            title.text(music.title)

            cover.attr('src', music.cover)

            $(playlist.find('li').get(index)).addClass('current').siblings().removeClass('current')

            if (autoplay) {
                audio[0].play()
                controls_mode.removeClass('play')
                controls_mode.addClass('pause')
            }
        }

        var drawSound        = function() {
            requestAnimationFrame(drawSound)

            audioAnalyser.getByteFrequencyData(frenquencyData)

            var height = soundDrawer.height()
            var width  = soundDrawer.width()

            soundDrawerCtx.clearRect(0, 0, width, height)

            for (var i = 0; i < width / 5; i++) {
                soundDrawerCtx.fillStyle = '#4CAF50'
                soundDrawerCtx.fillRect(
                    i * 5,
                    height - (frenquencyData[i] / 255 * height),
                    5,
                    frenquencyData[i] / 255 * height
                )
            }
        }



        $.getJSON('playlist.json', function(response) {
            audio.trigger({
                type   : 'loadedplaylist',
                playlist: response
            })
        })

        audio.on('loadedplaylist', function(event) {
            musics = event.playlist

            for (var index in event.playlist) {
                playlist.append($('<li />', {
                    text: event.playlist[index].title,
                    'data-index': index
                }))
            }

            play(0, false)
        })

        audio.on('loadedmetadata', function() {
            progress_total.text(parseTime(this.duration))
        })

        audio.on('timeupdate', function() {
            var perCent = this.currentTime / this.duration * 100

            progress_bar.css('width', perCent + '%')
            progress_cursor.css('left', perCent + '%')
            progress_current.text(parseTime(this.currentTime))
        })

        audio.on('ended', function() {
            if (controls_random.hasClass('active')) {
                play(Math.floor(Math.random() * musics.length))
            } else if (!controls_loop.hasClass('active')) {
                controls_next.trigger('click')
            }
        })

        controls_loop.on('click', function() {
            if (controls_random.hasClass('active')) {
                controls_random.trigger('click')
            }

            audio.attr('loop', !audio.attr('loop'))
            $(this).toggleClass('active')
        })

        controls_random.on('click', function() {
            if (controls_loop.hasClass('active')) {
                controls_loop.trigger('click')
            }

            $(this).toggleClass('active')
        })

        controls_mode.on('click', function() {
            var elem = $(this)

            if (elem.hasClass('play')) {
                elem.removeClass('play')
                elem.addClass('pause')
                audio[0].play()
                drawSound()
            } else {
                elem.removeClass('pause')
                elem.addClass('play')
                audio[0].pause()
            }
        })

        controls_next.on('click', function() {
            play(parseInt(audio.attr('data-index')) + 1)
        })

        controls_prev.on('click', function() {
            audio[0].currentTime = 0
        })

        controls_prev.on('dblclick', function() {
            play(parseInt(audio.attr('data-index')) - 1)
        })

        playlist.on('click', 'li', function() {
            play($(this).attr('data-index'))
        })

        volume.on('input change', function() {
            audio[0].volume = $(this).val() / 100
        })

        progress_cursor.on('mousedown', function() {
            drag_cursor = true
        })

        $(document).on('mouseup', function() {
            drag_cursor = false
        })

        $(document).on('mousemove', function(event) {
            if (drag_cursor) {
                var bar = progress.find('.progress__bar')
                var pos = event.clientX - bar.offset().left

                if (pos > bar.width()) {
                    pos = bar.width()
                    drag_cursor = false
                }

                audio[0].currentTime = audio[0].duration * pos / bar.width()
            }
        })

    })

})(jQuery)
