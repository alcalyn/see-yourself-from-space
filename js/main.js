(function (L, Content) {
    var map = L.map('mapid').setView([48.85613168160397, 2.349357604980469], 11);
    new L.Hash(map);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png').addTo(map);

    map.on('click', function(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    });

    var photosLength = Content.photos.length;

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

        L.imageOverlay.rotated(photo.url, topleft, topright, bottomleft, {
            opacity: 0.5,
            alt: photo.alt
        }).addTo(map);
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
})(L, Content);
