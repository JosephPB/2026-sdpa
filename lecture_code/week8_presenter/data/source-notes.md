# Data and sources

## DfT traffic

Copied from the saved Week 7 materials. Original retrieval: 31 October 2026. Source: Department for Transport, https://roadtraffic.dft.gov.uk/api/raw-counts . Download guidance: https://roadtraffic.dft.gov.uk/downloads . Query: Bristol local-authority ID 144, year 2023, page size 10000.

`raw/traffic-2023.json` contains the original response: 936 records, `last_page=1`, no next page. One record represents a count point/date/hour/direction. This is sampled raw survey data, not continuous monitoring or annual average daily flow. The date range of the observations and the download date are different concepts.

`bristol_traffic_2023.csv`, `count_points.csv` and `bristol_no2_2023.csv` are copied unchanged from Week 7. Traffic columns rename cars_and_taxis to cars and pedal_cycles to bicycles, among other display-friendly names. Cars includes taxis. Motor-vehicle totals include components not individually displayed; do not add that total to its components.

Traffic charts first sum directions within site/date/hour. The line chart uses site 6401, A38, 13 July 2023. Site comparisons use mean observed site-hour counts and do not remove differences in survey timing or sampling design. The pie chart represents only the four named vehicle categories, not all road traffic.

Data contain public-sector information licensed under the Open Government Licence v3.0: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/ . Retain DfT attribution and source limitations.

`provenance.json` records the saved query, retrieval date and record count. The demonstration saves its own live/saved mode separately. A response object made from saved bytes is explicitly labelled and is not evidence of a successful live network request.

## Other material

The duck image and memory activity are reused from Week 7. Diagram examples use selected traffic fields or explicitly illustrative records. The discretisation animation uses illustrative continuous measurements; it does not display the Bristol monitor dataset. The copied annual NO2 CSV is optional context and is not joined to hourly traffic records.

`traffic-page.html` is a local teaching fixture made from the first three saved DfT records. It is not a publisher page. Its car counts are 182, 233 and 286. The local HTTP server serves it unchanged at `/traffic`.

The GET/POST animation illustrates a separate teaching resource `/observations`. It makes no network requests. The optional local server implements these routes with temporary in-memory state.

## Documentation

- Requests: https://requests.readthedocs.io/en/latest/user/quickstart/
- HTTP methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
- BeautifulSoup: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- REST: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
- pandas cut/qcut: https://pandas.pydata.org/docs/reference/api/pandas.cut.html and https://pandas.pydata.org/docs/reference/api/pandas.qcut.html

Current Requests/HTTP/BeautifulSoup/pandas documentation was consulted during planning/drafting. The new `live/bristol_traffic_pipeline.py` was verified against the live DfT API on 8 November 2026: HTTP 200, JSON response, 936 records, one page. Its processed counts matched the bundled saved response. The script uses a real request by default; `--saved` explicitly selects the 31 October response. The earlier compact `live_demo.py` retains its saved-by-default behaviour. Rehearse the live request before class.

## Revised public scraping demonstration

The lecture now requests https://books.toscrape.com/ directly. This public site is intended for scraping practice and explicitly labels prices and ratings as artificial. The live request was verified on 8 November 2026. The first three title/price pairs were A Light in the Attic / £51.77, Tipping the Velvet / £53.74 and Soumission / £50.10.

`raw/books-to-scrape.html` is a captured copy of that public page, with retrieval metadata alongside. The normal demonstration makes a live request; `--saved` is an explicitly selected fallback. The older local traffic fixture remains available for optional experiments but is not used by the lecture's scraping slides.
