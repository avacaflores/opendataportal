<?php
/**
 * Template Name: Flow
 */
get_header(); ?>
  <section>
    <div class="container">
      <div class="row">
        <p id="sentence" class="sentence col-xs-12">
        </p>
        <h5 class="col-header col-xs-3" style="text-align: center">
        Where the money comes from
        <span class="donor info"></span>
        </h5>
        <h5 class="col-header col-xs-3">
        Where the money goes
        </h5>
        <h5 class="col-header col-xs-3">
        Where the money is spent
        </h5>
        <h5 class="col-header col-xs-3" style="text-align: center">
        What the money is spent on
        <span class="sector info"></span>
        </h5>
        <div class="col-xs-12">
          <div id="chart">
          </div>
          <p class="disclaimer">
          Negative values were excluded from the data to create this diagram.
          </p>
        </div>
      </div>
    </div>
  </section>

<?php get_footer(); ?>