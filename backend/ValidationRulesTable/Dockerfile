FROM python:3.9-slim

EXPOSE 5005

WORKDIR /usr/src/app

COPY ./backend/ValidationRulesTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ValidationRulesTable/ValidationRulesTable.py ./

CMD [ "python", "./ValidationRulesTable.py"]