(function (window, document, L, Content, noUiSlider, DPI, Math, Promise) {
    var mapOptions = {};

    /*
     * Context menu
     */
    mapOptions.contextmenu = true;
    mapOptions.contextmenuWidth = 180;
    mapOptions.contextmenuItems = [
        {
            text: 'Get coordinates',
            callback: function (context) {
                console.log(context);
                alert('lat: '+context.latlng.lat+', lon: '+context.latlng.lng);
            }
        },
        {
            separator: true
        },
        {
            text: 'Jump to ISS location',
            callback: function () {
                loadIssPosition().then(function (iss) {
                    updateISS(iss);
                    jumpToIss();
                });
            }
        }
    ];

    /*
     * Map
     */
    var map = L.map('mapid', mapOptions).setView([48.85613168160397, 2.349357604980469], 11);
    new L.Hash(map);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        attribution: 'Wikimedia maps beta | Map data © <a href="http://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    map.on('click', function(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    });

    /*
     * Add photographies
     */
    var photosLength = Content.photos.length;
    var imageOverlays = [];

    for (var i = 0; i < photosLength; i++) {
        var photo = Content.photos[i];
        var a = photo.anchors;

        var anchors = calculateAnchors(
            p(a[0].pixel.x, a[0].pixel.y), p(a[0].coords.lat, a[0].coords.lon),
            p(a[1].pixel.x, a[1].pixel.y), p(a[1].coords.lat, a[1].coords.lon),
            p(a[2].pixel.x, a[2].pixel.y), p(a[2].coords.lat, a[2].coords.lon),
            p(photo.size.width, photo.size.height)
        );

        var topleft    = L.latLng(anchors[0].x, anchors[0].y),
            topright   = L.latLng(anchors[1].x, anchors[1].y),
            bottomleft = L.latLng(anchors[2].x, anchors[2].y);

        var imageOverlay = L.imageOverlay.rotated(photo.url, topleft, topright, bottomleft, {
            alt: photo.alt
        }).addTo(map);

        imageOverlays.push(imageOverlay);
    }

    setPhotosOpacity(1);

    function setPhotosOpacity(opacity) {
        for (var i = 0; i < photosLength; i++) {
            var imageOverlay = imageOverlays[i];

            imageOverlay.setOpacity(opacity);
        }
    }

    function calculateAnchors(a, earthA, b, earthB, c, earthC, photoSize) {
        var system = new System(a, earthA, b, earthB, c, earthC);

        return system.pictureAnchors(photoSize);
    }

    function p(x, y) {
        return {x: x, y: y};
    }

    function System(a, earth_a, b, earth_b, c, earth_c) {
        var that = this;

        var i = p(b.x - a.x, b.y - a.y);
        var j = p(c.x - a.x, c.y - a.y);

        var earth_i = p(earth_b.x - earth_a.x, earth_b.y - earth_a.y);
        var earth_j = p(earth_c.x - earth_a.x, earth_c.y - earth_a.y);

        /**
         * @param {Object} m Coordonnées sur l'image
         *
         * @returns {Object} Coordonnées sur la Terre
         */
        this.coords = function (m) {
            var x = (m.x - a.x - (j.x / j.y) * (m.y - a.y)) / (i.x - i.y * (j.x / j.y));
            var y = (m.y - x * i.y - a.y) / j.y;

            return p(
                earth_a.x + x * earth_i.x + y * earth_j.x,
                earth_a.y + x * earth_i.y + y * earth_j.y
            );
        };

        this.pictureAnchors = function (size) {
            return [
                that.coords(p(0, 0)),
                that.coords(p(size.x, 0)),
                that.coords(p(0, size.y))
            ];
        };
    }

    /*
     * Opacity slider
     */
    var opacitySlider = document.getElementById('opacity-slider');

    noUiSlider.create(opacitySlider, {
        start: 1,
        range: {
            min: 0,
            max: 1
        }
    });

    opacitySlider.noUiSlider.on('slide', function (n) {
        setPhotosOpacity(n[0]);
    });

    /*
     * ISS marker
     */
    var issIcon = L.icon({
        iconUrl: 'img/iss-icon.png',
        shadowUrl: 'img/iss-icon-shadow.png',

        iconSize:     [25, 41],
        shadowSize:   [41, 41],
        iconAnchor:   [12, 41],
        shadowAnchor: [13, 41],
        popupAnchor:  [0, -45]
    });

    /*
     * ISS position
     */
    var issDistanceInMeters = 400000;
    var issMarker = L.marker(null, {icon: issIcon});
    var issPopup = L.popup({autoPan: false});
    var issLatLng = new L.LatLng(0, 0);

    function getIssDistanceInCentimeters(latitude) {
        var metersPerPixel = 40075016.686 * Math.abs(Math.cos(latitude * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
        var issDistanceInPixels = issDistanceInMeters / metersPerPixel;
        var issDistanceInInch = issDistanceInPixels / DPI.x;
        var issDistanceInCentimeters = issDistanceInInch * 2.54;

        return issDistanceInCentimeters;
    }

    function loadIssPosition(timestamps) {
        if (!timestamps) {
            return jQuery.get('https://api.wheretheiss.at/v1/satellites/25544');
        } else {
            return jQuery.get('https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps='+timestamps.join(','));
        }
    }

    function updateISS(iss) {
        issLatLng = new L.LatLng(iss.latitude, iss.longitude);
        var cm = Math.round(getIssDistanceInCentimeters(iss.latitude) * 10) / 10;
        var info = [
            '<b>ISS current location</b>',
            '<br /><b>Speed</b>: '+Math.round(iss.velocity)+' km/h',
            '<br /><b>Visibility</b>: '+iss.visibility,
            '<br /><b>Altitude</b>: '+(Math.round(iss.altitude * 10) / 10)+' km',
            '<br /><i>or <b>'+cm+' cm</b> from your screen'
        ].join('');

        issPopup.setContent(info);

        issMarker.setLatLng(issLatLng);
        issMarker.addTo(map);
        issMarker.bindPopup(issPopup).openPopup();
    }

    function jumpToIss() {
        map.panTo(issLatLng);
    }
})(window, document, L, Content, noUiSlider, DPI, Math, Promise);
