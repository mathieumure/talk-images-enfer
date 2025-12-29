vcl 4.1;

# Backend imgproxy
backend default {
    .host = "imgproxy";
    .port = "8080";
    .connect_timeout = 30s;
    .first_byte_timeout = 30s;
    .between_bytes_timeout = 30s;
}

# Définit ce qui doit être mis en cache
sub vcl_recv {
    # Retire tous les cookies (pas besoin pour les images)
    unset req.http.Cookie;

    # Normalise l'Accept-Encoding pour améliorer le cache
    if (req.http.Accept-Encoding) {
        if (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } elsif (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }
}

# Définit le comportement du cache
sub vcl_backend_response {
    # Cache toutes les réponses réussies
    if (beresp.status == 200) {
        # Cache pendant 24 heures
        set beresp.ttl = 24h;

        # Grace period de 1 heure (sert du contenu périmé si backend down)
        set beresp.grace = 1h;

        # Retire les cookies des réponses
        unset beresp.http.Set-Cookie;
    }

    # Ne pas cacher les erreurs
    if (beresp.status >= 400) {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
        return (deliver);
    }
}

# Ajoute des headers de debug
sub vcl_deliver {
    # Indique si la réponse vient du cache (HIT) ou non (MISS)
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Retire les headers Varnish internes
    unset resp.http.Via;
    unset resp.http.X-Varnish;
}