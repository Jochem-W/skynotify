# Skynotify

A containerised service that provides real-time push notifications for Bluesky
posts, officially hosted on [skynotify.co](https://skynotify.co/) and easily
self-hostable.

## Installing

1. Install Docker and Docker Compose
2. Clone or download the repository
3. Create a Firebase project with Cloud Messaging turned on
4. Copy `example.env` to `.env` and fill in the empty values
5. Place Firebase Admin SDK credentials in `server/firebase.json`
6. Run `docker compose build`
7. Run `docker compose up -d`

The service will now be running in the background. To make the service
accessible from the outside on port 80, the following can be added to `app` in
`docker-compose.yml`:

```yml
ports:
  - "80:3000"
```

### InfluxDB

For monitoring and statistics, InfluxDB has been integrated into the Compose
file and Go application. The amount and types of notifications sent
and the amount of operations processed from the Bluesky firehose are stored for displaying in a graph. This latter is
also used to keep track of the last processed commit, which allows for the
application to be restarted without dropping notifications.

## Contributing

All contributions, issues and pull requests are welcome, but I can't guarantee
that I'll have the time to keep up with everything. To start contributing,
you'll need to install the following:

- Go
- Node.js
  - Node.js 23 is currently not supported
- pnpm

## License

Copyright (C) 2024 Jochem-W

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
