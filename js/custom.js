d3.select('#content')
  .selectAll('p')
  .data([8, 15, 16, 23, 42])
  .enter()
  .append('p')
  .text(function(d) {
    return 'I’m number ' + d + '!';
  });

d3.selectAll('circle').each(function(d, i) {
  var odd = i % 2 === 1;

  d3.select(this)
    .style('fill', odd ? 'orange' : '#ddd')
    .attr('r', odd ? 40 : 20);
});

var svg = d3.select('#svgClock'),
  width = +svg.attr('width'),
  height = +svg.attr('height'),
  radius = Math.min(width, height) / 1.9,
  bodyRadius = radius / 23,
  dotRadius = bodyRadius - 8;

var pi = Math.PI;

var fields = [
  { radius: 0.2 * radius, format: d3.timeFormat('%B'), interval: d3.timeYear },
  { radius: 0.3 * radius, format: formatDate, interval: d3.timeMonth },
  { radius: 0.4 * radius, format: d3.timeFormat('%A'), interval: d3.timeWeek },
  {
    radius: 0.6 * radius,
    format: d3.timeFormat('%-H hours'),
    interval: d3.timeDay,
  },
  {
    radius: 0.7 * radius,
    format: d3.timeFormat('%-M minutes'),
    interval: d3.timeHour,
  },
  {
    radius: 0.8 * radius,
    format: d3.timeFormat('%-S seconds'),
    interval: d3.timeMinute,
  },
];

var color = d3.scaleRainbow().domain([0, 360]);

var arcBody = d3
  .arc()
  .startAngle(function(d) {
    return bodyRadius / d.radius;
  })
  .endAngle(function(d) {
    return -pi - bodyRadius / d.radius;
  })
  .innerRadius(function(d) {
    return d.radius - bodyRadius;
  })
  .outerRadius(function(d) {
    return d.radius + bodyRadius;
  })
  .cornerRadius(bodyRadius);

var arcTextPath = d3
  .arc()
  .startAngle(function(d) {
    return -bodyRadius / d.radius;
  })
  .endAngle(-pi)
  .innerRadius(function(d) {
    return d.radius;
  })
  .outerRadius(function(d) {
    return d.radius;
  });

var g = svg
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

g.append('g')
  .attr('class', 'tracks')
  .selectAll('circle')
  .data(fields)
  .enter()
  .append('circle')
  .attr('r', function(d) {
    return d.radius;
  });

var body = g
  .append('g')
  .attr('class', 'bodies')
  .selectAll('g')
  .data(fields)
  .enter()
  .append('g');

body.append('path').attr('d', function(d) {
  return (
    arcBody(d) +
    'M0,' +
    (dotRadius - d.radius) +
    'a' +
    dotRadius +
    ',' +
    dotRadius +
    ' 0 0,1 0,' +
    -dotRadius * 2 +
    'a' +
    dotRadius +
    ',' +
    dotRadius +
    ' 0 0,1 0,' +
    dotRadius * 2
  );
});

body
  .append('path')
  .attr('class', 'text-path')
  .attr('id', function(d, i) {
    return 'body-text-path-' + i;
  })
  .attr('d', arcTextPath);

var bodyText = body
  .append('text')
  .attr('dy', '.35em')
  .append('textPath')
  .attr('xlink:href', function(d, i) {
    return '#body-text-path-' + i;
  });

tick();

d3.timer(tick);

function tick() {
  var now = Date.now();

  fields.forEach(function(d) {
    var start = d.interval(now),
      end = d.interval.offset(start, 1);
    d.angle = Math.round(((now - start) / (end - start)) * 360 * 100) / 100;
  });

  body
    .style('fill', function(d) {
      return color(d.angle);
    })
    .attr('transform', function(d) {
      return 'rotate(' + d.angle + ')';
    });

  bodyText
    .attr('startOffset', function(d, i) {
      return d.angle <= 90 || d.angle > 270 ? '100%' : '0%';
    })
    .attr('text-anchor', function(d, i) {
      return d.angle <= 90 || d.angle > 270 ? 'end' : 'start';
    })
    .text(function(d) {
      return d.format(now);
    });
}

function formatDate(d) {
  d = new Date(d).getDate();
  switch (10 <= d && d <= 19 ? 10 : d % 10) {
    case 1:
      d += 'st';
      break;
    case 2:
      d += 'nd';
      break;
    case 3:
      d += 'rd';
      break;
    default:
      d += 'th';
      break;
  }
  return d;
}
