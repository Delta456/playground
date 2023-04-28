module main

import net.http

pub fn (mut app Server) send_analytics(url string) {
	ip := app.ip()
	http.post('http://localhost:8100/a', '{ "url": "${url}", "ip": "${ip}", "site_id": 0 }') or {}
}
