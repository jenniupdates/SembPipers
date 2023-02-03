FROM python:3.9-slim

EXPOSE 5011

WORKDIR /usr/src/app

COPY ./backend/ProcessValidation/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ProcessValidation/ProcessValidation.py ./

CMD [ "python", "./ProcessValidation.py"]