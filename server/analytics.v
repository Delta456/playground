module main

import net.http

pub fn send_analytics(url string) {
	http.post('http://localhost:8100/a', '{ "url": "${url}", "site_id": 0 }') or {}
}
