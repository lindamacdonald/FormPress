FROM node:12.14-alpine3.10 as base

FROM base as frontend_builder

ENV PATH="/node_modules/.bin:$PATH"
ENV REACT_APP_BACKEND='https://app-stage.formpress.org'
ENV REACT_APP_FP_ENV="production"
ENV REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID="763212824993-o0fl1ru6okjbcltn69sui769ve3cfgtf.apps.googleusercontent.com"
ENV REACT_APP_HOMEURL="https://stage.formpress.org"

ADD frontend /frontend
RUN cd /frontend &&\
  yarn &&\
  yarn build

FROM base as final

ENV SERVER_PORT=3001
ENV FP_ENV=production

RUN mkdir /src
RUN mkdir /frontend

COPY --from=frontend_builder /frontend/build /frontend/build
COPY --from=frontend_builder /frontend/src /frontend/src

WORKDIR /src
ADD backend /src
RUN yarn install

EXPOSE 3001

ENTRYPOINT ["npm", "start"]
