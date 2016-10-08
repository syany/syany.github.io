/*!
 * Find Address for map smple v1.0
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Copyright 2016 syany
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * Date: 2016-09-19
 */
;(function($, window) {
  $(function() {

    var marker = null,
    resultAddress = null,
    mapObj = null;

    var $postalcode = $('#postalcode'),
    $prefecture = $('#prefecture'),
    $cities = $('#cities'),
    $buildings = $('#buildings');

    /**
     * Google Geocodeの結果用メソッド。<br>
     * 正常な戻り値があれば、マーカーを再セットし、OKボタン付き吹き出しを表示する。
     */
    function resultGeocode(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0].geometry) {
          // マーカーのリセット
          if (marker) {
            marker.setMap(null);
          }
          // マーカーの再設定
          resultAddress = results[0];
          marker = new google.maps.Marker({
            position: resultAddress.geometry.location,
            map: mapObj
          });
          // 吹き出しの表示
          new google.maps.InfoWindow({
            content: '[' + resultAddress.formatted_address + ']を使用しますか？<br />'+
             '<span style="color:gray;">(Lat, Lng) = ' + resultAddress.geometry.location + '</span><br />'+
             '<input type="button" id="uraAddressOK" value="OK" onClick="uraCallback();" />'
          }).open(mapObj, marker);
        }
      } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
        alert("リクエストエラー。geocode()向けGeocoderRequestを確認してください");
      } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        alert("一定時間内に送るリクエスト数の限界エラー");
      } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
        alert("このページではジオコーダの利用が許可されていません");
      } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
        alert("サーバエラー");
      } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
        alert("ゼロエラー");
      } else if (status == google.maps.GeocoderStatus.ERROR) {
        alert("サーバ通信時のエラー");
      } else {
        alert("不明");
      }
    }
    /**
     * 緯度経度からGeocoder→Mapへ反映を行う。
     */
    function getGeocodeLatLng(latLng) {
      var geocoderObj = new google.maps.Geocoder();
      geocoderObj.geocode({
        latLng: latLng
      }, resultGeocode);
    }
    /**
     * 住所（キーワード）からGeocoder→Mapへ反映を行う。
     */
    function getGeocodeAddress(address) {
      var geocoderObj = new google.maps.Geocoder();
      geocoderObj.geocode({
        address: address
      }, resultGeocode);
    }
    /**
     * Map上に出力された吹き出しのOK押下に親ウィンドウ内フォームの反映
     */
    window.uraCallback = function(){
      // 一度文字列をリセット
      $postalcode.val('');
      $prefecture.val('');
      $cities.val('');
      $buildings.val('');
      // タイプを条件に各フォームに値を入れてく
      for(var address,oldSublocality, idx = resultAddress.address_components.length - 1;
        address = resultAddress.address_components[idx]; idx--) {
        var type = address.types[0];
        // "postal_code":郵便番号
        // "administrative_area_level_1": 都道府県
        // "locality": 市町村
        // "political":丁目,("sublocality_level_4-6":号)
        // "premise"：ビル
        if (type === 'locality') {
          $cities.val($cities.val() + address.long_name);
        } else if (type === 'political') {
          var sublocality = address.types[address.types.length - 1];
          if ((sublocality === 'sublocality_level_4' && oldSublocality === 'sublocality_level_3') ||
              (sublocality === 'sublocality_level_5' && oldSublocality === 'sublocality_level_4') ||
              (sublocality === 'sublocality_level_6' && oldSublocality === 'sublocality_level_5')) {
            // 番地の後号が続く場合、数値がつながらないようにする（２－２が２２とならないよう）
            $cities.val($cities.val() + '－' + address.long_name);
          } else {
            $cities.val($cities.val() + address.long_name);
          }
          oldSublocality = sublocality;
        } else if (type === 'administrative_area_level_1') {
          $prefecture.val( $prefecture.val() + address.long_name);
        } else if (type === 'postal_code') {
          $postalcode.val($postalcode.val() + address.long_name);
        } else if (type === 'premise') {
          $buildings.val($buildings.val() + address.long_name);
        }
      }
      // 必要ならばここで閉じる
      $('#mapDialog').dialog('close');
    };

    /**
     * Google Map API ロード後実行
     */
    function afterGoogleScript() {
      $('#mapDialog').dialog({
        title: '地図をクリックして、よろしければ「OK」を押してください。',
        modal: true,
        height: 453,
        width : 718,
        // ダイアログ
        open: function() {
          mapObj = new google.maps.Map(
              document.getElementById('UraAddressMap'), {
                zoom: 7,
                center: new google.maps.LatLng(35.6983841, 139.7730348),
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });
          /**
           * Mapの対象箇所クリック→Geocoder→Mapへ反映を行う。
           */
          google.maps.event.addListener(mapObj, 'click', function(mouseEvent) {
            getGeocodeLatLng(mouseEvent.latLng);
          });

          // 初期設定。住所情報が存在する場合、検索を開始する。
          var addressText = $postalcode.val();
          addressText += (addressText) ? ' ' + $prefecture.val() : $prefecture.val();
          addressText += (addressText) ? ' ' + $cities.val() : $cities.val();
          addressText += (addressText) ? ' ' + $buildings.val() : $buildings.val();
          if (addressText) {
            mapObj.setZoom(17);
            getGeocodeAddress(addressText);
          }
        }
      });
    }
    // 「住所入力」クリック時
    $('#search4map').on('click', function(event){
      if (!!!window.google) {
        $.getScript('http://maps.googleapis.com/maps/api/js?key=AIzaSyADoj638tj87JAUs4LP5bU9tDJg-goaSsY', afterGoogleScript);
      } else {
        afterGoogleScript();
      }
    });
  });
})(jQuery, window);