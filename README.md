Earth view with Thomas Pesquet photographies from ISS
=====================================================

![Paris from ISS](screenshot.jpg)

Thomas Pesquet, the french astronaut on ISS,
is taking many photographies of earth, especially cities.

This application references some of these photographies,
and superimposes them on a Earth view.

Just navigate on the Earth like Google Maps,
and switch between Earth view/Earthphotographies from ISS.

You will maybe see your city or your house from the ISS!


### Demonstration

[Check the Demonstration](https://alcalyn.github.io/see-yourself-from-space).


## Install locally

``` bash
git clone https://github.com/alcalyn/see-yourself-from-space.git
```

Then, using your browser, go to the `index.html` file
(no need for webserver, only html/js).


## Photographies

For now you can navigate to these locations:

 - Paris, France
 - La Rochelle, France
 - Venezia, Italia


## Technical stack

This application uses:

 - [Leaflet](http://leafletjs.com/) for map view
 - Thomas Pesquet photographies from his [Twitter account](https://twitter.com/Thom_astro)


## Adding a photography

Want to add your city ?

Fork the project, and add the photography to the `photos/` folder.

Then go to `js/content.js`, and duplicate a `photo` item.

First, it requires a few basics informations like
the photo url, size in pixels, `day` or `night` photography.

And last but not least, it needs three *anchor* points,
for which you need to know the coordinates **both** in pixels and GPS coords.

They should (recommanded) form a triangle, the greatest possible,
and the nearest to equilateral (not a flat triangle).

And choose a precise enough point like streets intersections,
end of road, peak of land, monument...

Then just refresh the `index.html` page and check the result.


## License

This application is under [MIT License](LICENSE).
