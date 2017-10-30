<?php
/**
 * Template Name: Map
 */
get_header(); 
global $tab_selected_dflt; 
global $tab_selected_spent;
?>
<style>
    
    #map {
        border : 4px solid #A3CCFF;
        border-radius : 5px;
        height : 480px;
        position: relative;
    }
    #myMapLegends{
        position: absolute;
        bottom: 0px;
        left : 0px;        
        width : auto;    
        background: #FFFFFF;
        opacity: 1;
        z-index: 9;
        border-radius: 5px;
        border: 2px solid #FFFFFF;
        padding: 4px;
        font-size: 14px;
        height : auto;
    }
    
    .allLegendDivs{
        clear:both;padding-bottom:2px;
    }
    .allLegendColorDivs{
        float:left;
        height:25px;
        width:25px;
        border-radius : 5px;
    }
    
    table .bar-chart svg {        
        float : right ;
    }
    #aid table td {
        font-size : 15px;
    }
   .newIndicatorData {
      height: 250px;
      overflow: auto;        
      border-top:1px solid #000000;
      border-bottom:1px solid #000000;
      margin: 10px 0px;
   }

   .newIndicatorData table {
      border:none;
   }

   .newIndicatorData table.dataTable tbody th {
      font-weight: bold;
      border-left:  1px solid #ddd;
      border-right: 1px solid #ddd;
  }
  .newIndicatorData table.dataTable tbody  td{
      border-left:  1px solid #eeeeee;
      border-right: 1px solid #eeeeee;
      
  }
  .newIndicatorData table.dataTable tbody th, .newIndicatorData table.dataTable tbody  td{
      vertical-align: middle;
      text-align: center;
      font-size: 12px;
  }
  .newIndicatorData table.dataTable tbody th:first-child, .newIndicatorData table.dataTable tbody  td:first-child{
    text-align: left;
  }
  .modal-dialog{
    width: 800px;
  }
   .headline{
    margin: 10px 0;
    
  }
   .headline #results{
    font-size : 16px !important;
    
  }
  .modal-content .modal-body .indiatorTitle{
      font-size : 14px;
      font-weight: bold;
  }
</style>

<script type="text/javascript" src="<?php echo get_template_directory_uri();?>/js/gmapdata.js"></script>
<div class="tabs">
    <div class="container">
      <nav>
        <p class="last-updated"></p>
        <ul>
          <li data-measure="b" class="<?php echo $tab_selected_dflt?>">Overview</li>
          <li data-measure="c" class="<?php echo $tab_selected_spent_donor?>">Funds Available</li>
          <li data-measure="e" class="<?php echo $tab_selected_spent?>">Spent</li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="container">
    <p id="sentence" class="sentence"></p>

    <div class="bottom-shadow">
      <div id="map"></div>
    </div>
    <p class="disclaimer">
      This map is for illustrative purposes and does not imply the expression
      of any opinion on the part of UNICEF, concerning the legal status of
      any country or territory or concerning the delimitation of frontiers or
      boundaries.
    </p>

    <div id="aid">
      <ol class="breadcrumb" v-component="vue-breadcrumbs" v-with="breadcrumbs">
        <li>
          <a v-if="crumbs.length > 0" href="#" v-on="click: pop($event, 0)">Back to {{ rootTitle | lowercase }}</a>
          <span v-if="crumbs.length < 1">{{ rootTitle }}</span>
        </li>
        <li v-repeat="crumbs" v-class="active: active">
          <a v-if="$index < crumbs.length - 1" href="#" v-on="click: pop($event, $index + 1)">Back to {{ title }}</a>
          <span v-if="$index >= crumbs.length - 1">{{ title }}</span>
        </li>
      </ol>
      <table class="data-table table hover">
        <thead>
          <tr>
            <th>Expands</th>
            <th>ID</th>
            <th>Name</th>
            <th>Number of Outputs</th>
            <!--<th>Planned Disbursement</th>-->
            <th>Planned Budget</th>
            <th>Allocation</th>
            <th>Expense</th>
            <th />
          </tr>
        </thead>
      </table>
    </div>

  </div>

<?php get_footer(); ?>