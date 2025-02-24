package com.king.backend.search.entity;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.io.IOException;

public class GeoPointJsonSerializer extends JsonSerializer<GeoPoint> {

    @Override
    public void serialize(GeoPoint value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value != null) {
            // Elasticsearch는 "lat,lon" 형식의 문자열을 geo_point로 파싱합니다.
            String geoPointStr = value.getLat() + "," + value.getLon();
            gen.writeString(geoPointStr);
        } else {
            gen.writeNull();
        }
    }
}
