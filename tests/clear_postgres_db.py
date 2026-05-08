import os

from sqlalchemy import MetaData, create_engine


def main():
    uri = os.environ.get(
        "DODO_PGURI",
        "postgresql+pg8000://dodo:dodo@localhost:8888/dodo",
    )

    engine = create_engine(uri)
    meta = MetaData()
    meta.reflect(bind=engine)
    meta.drop_all(bind=engine)


if __name__ == "__main__":
    main()


