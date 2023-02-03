FROM python:3.9-slim

EXPOSE 5020

WORKDIR /usr/src/app

COPY ./backend/ManipulationFormulaTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ManipulationFormulaTable/ManipulationFormulaTable.py ./

CMD [ "python", "./ManipulationFormulaTable.py"]


