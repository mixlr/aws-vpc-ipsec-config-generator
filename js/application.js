(function() {
  var regexIp = /\d+\.\d+\.\d+\.\d+/;
  var data;
  var config;

  function reset() {
    data = {};
    config = $('#config').val();
    $('textarea[readonly]').empty();
  }

  function scan(regex, txt) {
    var matches = [];
    var match = regex.exec(txt);
    while(match) {
      matches.push(match[1]);
      match = regex.exec(txt);
    }

    return matches;
  }

  function fail() {
    alert('Unable to parse configuration file. Try again, make sure the configuration file is valid and you have entered AWS and remote network CIDRs.');
  }

  function parse() {
    var vpgIps = scan(/Virtual Private Gateway\s+:\s+(\d+\.\d+\.\d+\.\d+(?:\/\d+)?)/g, config);
    if(vpgIps.length != 4) {
      return false;
    }

    data['outside_vpg_ip1'] = vpgIps[0];
    data['inside_vpg_ip1'] = vpgIps[1];
    data['outside_vpg_ip2'] = vpgIps[2];
    data['inside_vpg_ip2'] = vpgIps[3];

    var cgIps = scan(/Customer Gateway\s+:\s+(\d+\.\d+\.\d+\.\d+(?:\/\d+)?)/g, config);
    if(cgIps.length != 4) {
      return false;
    }
    data['outside_cg_ip1'] = cgIps[0];
    data['inside_cg_ip1'] = cgIps[1];
    data['outside_cg_ip2'] = cgIps[2];
    data['inside_cg_ip2'] = cgIps[3];

    var psks = scan(/Pre-Shared Key\s+:\s+([^\s]+)/g, config);
    if(psks.length != 2) {
      return false;
    }
    data['psk1'] = psks[0];
    data['psk2'] = psks[1];


    data['aws_cidr'] = $('#aws_network').val();
    data['remote_cidr'] = $('#remote_network').val();
    if( !data['aws_cidr'] || !data['remote_cidr'] ) {
      return false;
    }

    return true;
  }

  function generateIpsecToolsConf() {
    var template = $('#ipsec_tools_conf_template').text();
    var rendered = $.trim(Mustache.render(template, data));
    $('#ipsec_tools_conf').html(rendered);
  }

  function generateRacoonConf() {
    var template = $('#racoon_conf_template').text();
    var rendered = $.trim(Mustache.render(template, data));
    $('#racoon_conf').html(rendered);
  }

  function generatePskTxt() {
    var template = $('#psk_template').text();
    var rendered = $.trim(Mustache.render(template, data));
    $('#psk_txt').text(rendered);
  }

  $(document).ready(function() {
    $('form').submit(function(e) {
      e.preventDefault();
      reset();
      if(parse()) {
        generateIpsecToolsConf();
        generateRacoonConf();
        generatePskTxt();
      } else {
        fail();
      }
    });
  });
})();
