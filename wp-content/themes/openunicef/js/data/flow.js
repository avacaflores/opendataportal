/* global d3 */
'use strict';

define(function () {

    function flowModel(year) {
        return $.ajax({
            url: TEMPLATE_PATH + '/json/flow/sankey_' + year + '.json',
            dataType: 'json'
        }).then(function (donors) {
            var idMap = {},
          sectors = 0;

            // Initialize the mapping from node ID to index and the total node value.
            donors.set.nodes.forEach(function (d, i) {
                idMap[d.id] = i;
                d.total_node_value = 0;
            });

            // Calculate total node values.
            donors.set.links.forEach(function (ln) {
                var src = donors.set.nodes[idMap[ln.source]],
            tgt = donors.set.nodes[idMap[ln.target]];

                if (src.type === 'donor') {
                    src.total_node_value += ln.value;
                }

                tgt.total_node_value += ln.value;
            });

            donors.set.nodes.sort(function (a, b) {
                return d3.descending(a.total_node_value, b.total_node_value);
            });

            // Update ID -> index mapping with sorted index for nodes and count
            // the number of sectors
            donors.set.nodes.forEach(function (d, i) {
                // Added by Rahul D. @01July15
                /*if (d.type == 'country' && d.name != '') {
                    if ((d.name).indexOf('(C)') >= 0) {
                        d.name = (d.name).replace('(C)', ''); 
                    }
                    if ((d.name).indexOf('(E)') >= 0) {
                        d.name = (d.name).replace('(E)', '');
                    }
                }*/
                // end
                idMap[d.id] = i;
                sectors += (d.type === 'sector') ? 1 : 0;
            });

            // Initialize links with an ID and references to their source and
            // target nodes.
            donors.set.links.forEach(function (ln) {
                ln.id = ln.source + '-' + ln.target;
                ln.source = idMap[ln.source];
                ln.target = idMap[ln.target];
            });

            return {
                asOf: donors.last_updated,
                donations: donors.totals.commitment,
                expenses: donors.totals.expense,
                sectors: sectors,
                nodes: donors.set.nodes,
                links: donors.set.links
            };
        });
    }

    return flowModel;
});
