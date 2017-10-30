<?php
    /**
     * Template Name: Document
     */
    get_header();
    global $showingNoOfRec;
?>


<div class="container">
    <div class="doc-bx">
        <div class="doc-right">             
            <?php
                include_once ('left-menu.php');
            ?>
        </div>
        <div class="doc-left">
            <input type="hidden" id="currSection" value="category" />
            <input type="hidden" id="currCategory" value="Show All" />
            <input type="hidden" id="currNoPage" value="0" />
            <?php
                $fetchDocCat = array(
                    'posts_per_page' => $showingNoOfRec,
                    'offset' => 0,
                    'meta_key' => false,
                    'orderby' => 'title',
                    'order' => 'ASC',
                    'post_type' => 'post-document',
                    'post_status' => 'publish',
                    'suppress_filters' => true,
                    'meta_query' => false
                );


                $the_docs = new WP_Query($fetchDocCat);
                $count_posts_query = $the_docs->post_count; //counting post from the query
                $count_posts = wp_count_posts('post-document');

                $published_posts = $count_posts->publish; // total count of publish post				
                $countPages = ceil($published_posts / $showingNoOfRec);

                ob_start();
            ?>
            <!--Advance Search Column -->
             
            <div id="advanceSearchFields" style="display: none;">
                
                <div class="resultDropdown">
                  <div><h3>Result by</h3></div>
                    <div class="form-group">
                        <div class="row">
                            
                            <?php
                                
                                $filterCategory = 17;
                                $subCatArray = [83, 84, 85, 86];
                                $taxonomyType = 'category';

                                $get_libraryList = array('parent' => $filterCategory, 'taxonomy' => $taxonomyType, 'hide_empty' => 0, 'orderby' => 'id', 'order' => 'ASC');
                                $libraries = get_categories($get_libraryList);
                                
                                
                                $allFilterBoxCategories = [];

                                if (count($libraries) > 0) {
                                    
                                    foreach ($libraries as $library) {

                                        if( (in_array($library->term_id, $subCatArray))  ){
                                            $fieldName = "cross_cutting";
                                            switch($library->term_id){
                                                case 83 : $fieldName = "cross_cutting"; break;
                                                case 84 : $fieldName = "geographic_area"; break;
                                                case 85 : $fieldName = "year"; break;
                                                case 86 : $fieldName = "report_type"; break;
                                            }
                                             
                                            ?>
                                                <div class="col-md-3 pr0">
                                                    <label><?php echo $library->name?></label>
                                                    <div class="select-box">
                                                        <select name="<?php echo $fieldName; ?>" id="<?php echo $fieldName; ?>" >
                                                            <option value='0'>Choose <?php echo $library->name?></option>
                                            <?php
                                            
                                            
                                            $get_sub_libraryList = array('parent' => $library->term_id, 'taxonomy' => $taxonomyType, 'hide_empty' => 0, 'orderby' => 'id', 'order' => 'ASC');
                                            $sub_libraries = get_categories($get_sub_libraryList);
                                            foreach($sub_libraries as $k => $v){
                                                $allFilterBoxCategories[] = $v->term_id;
                                                echo "<option value='{$v->term_id}' >{$v->name}</option>";
                                            }
                                            
                                            ?>
                                                        </select>
                                                    </div>
                                                </div>
                                            <?php
                                            
                                            
                                        }
                                    }
                                    
                                    
                                    
                                    
                                }
                            ?>
                             
                        </div>
                    </div>
                </div>
            
                <div class="col-md-12">
                  <div class="row text-right">
                    <button type="button" onclick="resetBtnclickHandler()" class="btn btn-primary" style="width:21%;">Reset</button>
                    <button type="button" onclick="goBtnclickHandler()" class="btn btn-primary" style="width:21%;">Go</button>
                  </div>
                   
                </div>
                <div class="devider"></div>
                <div class="resulShorting shortingDiv">
                    <div class="row">
                        <div class="col-sm-3 shortBy">
                          <div class="select-box">
                            <select name="orderby" id="orderby" onchange="orderBychangeHandler()">
                                <option value="title@@ASC" >Sort by</option>
                                <option value="title@@ASC">Name(Ascending)</option>
                                <option value="title@@DESC">Name(Descending)</option>
                            </select>
                            </div> 
                        </div>                     
                    </div>
                </div>
            
            </div>
            
             
            
            <div class="dot-plc-bg-cnt-docpg" >
                <h5 style="text-align: right;padding-right: 1px;" class="col-header col-xs-3 pull-right">
                    Showing <span id="crntTotal"><?php echo $showingNoOfRec; ?></span> 
                    out of <span id="allTotal"><?php echo $published_posts; ?></span>
                </h5>
            </div>

            
            <div class="dot-plc-bg docpage" id="category-post-content"> 
                <!--Search Result Starts here-->
                <?php
                    if ($the_docs->have_posts()) {
                        echo '<ul>';
                        echo '<input type="hidden" id="totNoOfPages" value="' . $countPages . '" />';
                        echo '<input type="hidden" id="published_posts" value="' . $published_posts . '" />';
                        //echo '<li style="text-align:right;font-size:12px;">'.$count_posts_query.' of '.$published_posts.'</li>';
                        while ($the_docs->have_posts()) { 
                            $the_docs->the_post();

                            $pdf_doc_option = get_field('pdf_doc_option');

                            if ((isset($pdf_doc_option)) && ($pdf_doc_option == 1)) {
                                $uploadFile_url = get_field('external_link');
                            } else {
                                $uploadFile_field = get_field('upload_file');
                                $uploadFile_url = wp_get_attachment_url($uploadFile_field);
                            }

                            $uploadFile_ext = strtolower(substr(strrchr($uploadFile_url, "."), 1));
                            
                            $fileExtArray = ['xlsx', 'xls', 'pdf','doc', 'ppt', 'pptx'];
                            
                            if (($uploadFile_ext != '') && in_array($uploadFile_ext, $fileExtArray)  ) {
                                $fetchthumbImage = get_template_directory_uri() . '/assets/'.$uploadFile_ext.'-icon.png';
                            } else {
                                $fetchthumbImage = get_template_directory_uri() . '/assets/word-icon.png';
                            }

                            $date = (get_field('date') != '') ? date_format(date_create('' . get_field('date') . ''), 'd-m-Y') : '';

                            //echo '<div class="doc-plc"><div class="title">'.get_the_title().'</div><a href="'.$uploadFile_url.'" target="_blank"><img src="'.$fetchthumbImage.'" /></a></div>';

                            echo '<li>
                                    <div class="img-bx"> <img src="' . $fetchthumbImage . '"></div>
                                    <div class="img-title"><a href="' . $uploadFile_url . '" target="_blank">' . get_the_title() . '</a>';
                            if ($date != '') {
                                echo '<span class="img-date" > ' . $date . ' </span>';
                            }
                            echo '</div>';
                            echo '<div class="img-sub-title">' . get_the_excerpt() . '</div>';
                            echo '</li>';

                        }
                        echo '</ul>';
                    };
                    wp_reset_postdata();
                    wp_reset_query();
                ?>       
  

            </div>	<!-- document place holder ends -->

            <div class="readmore_bar" > <a href="javascript:void(0);"> Show More </a></div>
            <div id="document-page-loading" style="display:none;text-align:center;">
                <img src="<?php echo get_template_directory_uri() . '/images/ajax-loader.gif'; ?>" />
            </div>

        </div>		
    </div>
</div> 
<script>
    var filterCategory = "<?php echo $filterCategory; ?>";
    var allFilterBoxCategories = <?php echo json_encode($allFilterBoxCategories); ?>;
</script> 
<?php get_footer(); ?>