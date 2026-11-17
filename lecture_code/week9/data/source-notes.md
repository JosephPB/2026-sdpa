# Week 9 data and visual sources

Prepared 15 November 2026. No new live data download was needed for the lecture.

## Traffic observations

Department for Transport, https://roadtraffic.dft.gov.uk/api/raw-counts and https://roadtraffic.dft.gov.uk/downloads . Saved Bristol, City of query: local-authority ID 144, year 2023, page size 10000; retrieved for Week 7 on 31 October 2026. The unchanged source CSV and site table are copied from Week 8. Public-sector data under the Open Government Licence v3.0: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/ .

936 records represent 40 count points and 33 dates. One record is a site/date/hour/direction, sampled between 07:00 and 18:00. A site may have one or two recorded directions. Cars includes taxis; buses includes coaches. The motor-vehicle total includes components not individually shown, and must not be added to those components.

`build_assets.py` sums recorded directions within site/date/hour to create 480 rows in `site_hours.csv`. These are observed site-hours, not independent continuous observations, annual average flow or all Bristol traffic. The example day is A38 site 6401 on 13 July 2023. Group comparison sites are 6401, 8599 and 16961. Mean comparisons do not correct for differences in survey timing, completeness or sampling design. Coordinate maps show recorded locations and do not interpolate between them.

The record-direction counts and cross-tabulations describe survey records, not vehicle counts. The correlation pairs cars and bicycles within the same observed site-hour. Its value is descriptive; independence of rows and statistical significance are not asserted.

## Air quality

Bristol City Council annual mean NO2 monitoring data, copied unchanged from the Week 7/8 CSV. 196 sites with 2023 means. Catalogue: https://www.arcgis.com/home/item.html?id=925cadfd3a034df3beea8f0088a942d0 . Service: https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_environment_and_planning/MapServer/8 .

`no2_ugm3` is annual mean NO2 in micrograms per cubic metre. `sample_count` preserves COUNT_2023; it is not a count of hourly traffic readings. The annual map is a separate reference. No correlation, nearest-neighbour pairing, interpolation or causal relationship with hourly traffic is claimed.

## Illustrative examples

The changed extreme point, normal reference curves, bar-baseline comparison, distribution shapes, discretisation values, correlation-pattern quiz, curved/within-group relationship examples, multivariate outlier, distance example, min-max arithmetic and small network are teaching constructions. Charts and notes identify these as illustrative. Random examples use fixed seed 9. The clinic deliberately presents an overgeneralised claim for critique.

## Visual credits

- From Data to Viz poster: Yan Holtz and Conor Healy, https://www.data-to-viz.com/ . Original source supplied by lecturer: https://attachments.convertkitcdnn2.com/1300146/4b522840-bd5d-4e58-b2f3-6042fb9fa9d6/poster-big.png . Full-resolution image is stored unchanged. Dimming and zooming are reversible display overlays, not changes to the source image.
- 61 Dataviz Caveats: Yan Holtz, https://www.data-to-viz.com/caveats.html . Selected original card images extracted from the supplied PDF retain their original credits. Adapted data figures cite relevant card numbers on their slides.
- Gapminder/Hans Rosling animation: extracted unchanged from original Week 9 slide 41 (`ppt/media/image42.gif`). Link: https://www.gapminder.org/fw/world-health-chart/ . Student handout uses its first frame as a labelled source illustration, not newly calculated data.
- University of Bristol slide logo, duck and duck detective: reused from the established Week 8 materials. No new decorative images generated.
- All new data charts are generated locally by `build_assets.py`; raw data remain unchanged.

## November revision: additional examples

- Original election leaflets: Full Fact, *Lowering the bar*, 28 November 2019, https://fullfact.org/politics/lowering-the-bar/ . The Gateshead example concerns source-election selection and an omitted independent candidate; the Suffolk Coastal example concerns bar-length ratios and an ambition arrow. Corrected comparison uses the cited 2017 results, 58.1%, 30.5%, 7.0%.
- Fox News unemployment graphic, broadcast 12 December 2011, reproduced by Nathan Yau: https://flowingdata.com/2011/12/12/fox-news-still-makes-awesome-charts/ . The plotted November position is inconsistent with its 8.6% label; it is not an inverted-axis example.
- Steel-production screenshot supplied by the lecturer: https://media.zenfs.com/en/aol_meidastouch_articles_772/20c5250ec0e2f16d6325190ad3689277 . Reproduced unchanged, including reader context. Used only to discuss the visible 80.2–81.8 axis, not as independent verification of production figures or policy effects.
- Datasaurus: Alberto Cairo; Justin Matejka and George Fitzmaurice, *Same Stats, Different Graphs*, CHI 2017, https://doi.org/10.1145/3025453.3025912 and https://www.research.autodesk.com/publications/same-stats-different-graphs/ . Tabular data saved from https://github.com/jumpingrivers/datasauRus/blob/main/inst/extdata/DatasaurusDozen-Long.tsv ; associated package licence saved alongside it. Original coordinates are replotted, not hand-drawn. Computed statistics are in the master's output/datasaurus-statistics.csv.
- Anscombe quartet: F. J. Anscombe (1973), *Graphs in Statistical Analysis*, https://doi.org/10.1080/00031305.1973.10478966 . Standard published coordinates reproduced in the figure generator; same approximate regression line and strong correlation, unlike the near-zero-correlation Datasaurus.
- The three clinic charts are deliberately flawed synthetic examples. Their solutions are in private notes only. The faceted traffic view retains every site-hour and all four variables, with hours explicitly binned into three intervals.

Routine adapted-guidance credits have been removed from visible slides at the lecturer's request. Poster and original-flashcard attribution remain visible; the original guidance provenance above is retained here.
