# DDRUM: Drugs, Diseases, RDF Und MesH

## Overview
The aim of this project was to develop a system that integrates multiple medical databases and provides a user-friendly web interface for querying a unified SPARQL database derived from them. This integration simplifies the process of accessing and retrieving medical data across various sources, enhancing research and analysis capabilities for medical professionals and researchers.

## Implementation

The implemented solution is based on a Python script designed to process XML files containing information about clinical trials and represent this data in RDF (Resource Description Framework) format. The script utilizes libraries for file manipulation, XML parsing, data processing, RDF manipulation, and visualization.

## Backend

The backend runs on a Flask application written in Python for querying a SPARQL endpoint hosted by a Fuseki server initialized with the serialized turtle database.

## Additional Information
For further details, please refer to [Project_DDRUM.pdf](https://github.com/Stintipacchio/DDRUM/blob/main/Project_DDRUM.pdf).