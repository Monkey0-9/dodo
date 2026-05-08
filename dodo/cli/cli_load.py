"""
This file contains functions for loading data into dodo's archival storage.

Data can be loaded with the following command, once a load function is defined:
```
dodo load <data-connector-type> --name <dataset-name> [ADDITIONAL ARGS]
```

"""

import typer

app = typer.Typer()


default_extensions = "txt,md,pdf"

