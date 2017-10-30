<?php
    function getSubCatTillNLevel($mainCatID, $taxonomyType, $taxonomyCount) {
        $catArray = [83, 84, 85, 86];
        $catArray = [17];
        $get_libraryList = array('parent' => $mainCatID, 'taxonomy' => $taxonomyType, 'hide_empty' => 0, 'orderby' => 'name', 'order' => 'ASC');
        $libraries = get_categories($get_libraryList);

        //echo '<pre>'; print_r($libraries); die();
        $html_librarySection = '';
        if (count($libraries) > 0) {
            foreach ($libraries as $library) {
                $termchildren = get_term_children($library->term_id, $taxonomyType);
                if ((sizeof($termchildren) > 0) && (!in_array($library->term_id, $catArray)) ) {
                    $html_librarySection.= ' <li class="active has-sub">';
                    $html_librarySection.= ' <a href="javascript:void(0)" term-id="'.$library->term_id.'" ><span>' . $library->name . '</span></a>';
                    $html_librarySection .= '<ul class="innerParentUL" parent-name="'.$library->name.'">' . getSubCatTillNLevel($library->term_id, $taxonomyType, $taxonomyCount) . '</ul>';
                } else {
                    $html_librarySection.= ' <li class="last-child"><a href="javascript:void(0)" term-id="'.$library->term_id.'" onclick="showMetheDoc($(this), \'' . $taxonomyType . '\',\'' . $library->name . '\',\'' . $taxonomyCount . '\')"><span>' . $library->name . '</span></a>';
                }
                $html_librarySection.= '</li>';
            }
        }
        return $html_librarySection;
    }
?>
<style>
    .docSearchDiv{        
        margin: 15px 0px;        
    }
    .docSearchDiv input{
        border: 1px solid #cecece;
        border-radius: 5px;
        padding: 5px;
        height : 32px;
        width : 233px;
        float:left;
    }
    .docSearchDiv a{
        background: #f2f3f4 none repeat scroll 0 0;
        border: 1px solid #e2e4e6;
        border-radius: 5px;
        margin-top: -2px;
        padding: 8px;
        text-align: center;
        float:right;
        display: inline;
    }
	
	.searchOutputString{   
		background-color: #d9edf7;
		color: #31708f;
		border:1px solid #bce8f1;
		margin-top: 15px;
		padding: 10px 8px;   
		display:none;		
    }
</style>

<!-- NEW MENU FOR FAQ AND GLOSSARY END-->
<!--<div id="document-menu-faqng">
    <ul class="parentUL" id="sec-cat">
        <?php
            $site_url = site_url();
            $currentUrl = get_the_permalink();
             
            $faqUrl         = $site_url."/faq/";
            $glossaryUrl    = $site_url."/glossary/";
            $documentUrl    = $site_url."/documents/";
            
        ?>
        <li class="last-child <?php echo ($currentUrl == $faqUrl) ? "active-bg" : "";?>" >
            <a href="<?php echo $faqUrl ; ?>" style="text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.35);">
                <span style="border-color: rgba(0, 0, 0, 0.35);">Frequently Asked Questions</span>
            </a>
        </li>
        <li class="last-child <?php echo ($currentUrl == $glossaryUrl) ? "active-bg" : "";?> ">
            <a href="<?php echo $glossaryUrl ; ?>" style="text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.35);">
                <span style="border-color: rgba(0, 0, 0, 0.35);">Glossary</span>
            </a>
        </li>
    </ul>
</div>-->
<!-- NEW MENU FOR FAQ AND GLOSSARY END-->
<h3>Document Categories</h3>
<div class="docSearchDiv">
    <input type="text" name="doc_keyword" id="doc_keyword" value="" placeholder="Search" />
    <a href="javascript:void(0);" onclick="keySearch()"> Search </a>
    <div style="clear:both;"></div>
	<div id="searchOutputString" class="searchOutputString"></div>
</div>

<div id="document-menu">
    <ul id="sec-cat" class="parentUL">
        <li class="last-child <?php echo ($currentUrl == $documentUrl) ? "active-bg" : "";?>"><a href="javascript:void(0)" onclick="showMetheDoc($(this), 'category', 'Show All', '<?php echo $showingNoOfRec; ?>', 'click')"><span>Show All</span></a></li>
        <?php echo getSubCatTillNLevel(1, 'category', $showingNoOfRec); ?>					
    </ul>				
</div>
<!--
<div id="tweetScroller" class="tweetPlc">
    <?php //dynamic_sidebar('sidebar-2'); ?> 
</div>-->
<script>
    function keySearch() {
        if($("#document-menu #sec-cat li.last-child.active-bg").length > 0){
            $("#document-menu #sec-cat li.last-child.active-bg, #document-menu #sec-cat li.last-child.active-bg a").trigger('click');
        }else{
            //$("#document-menu #sec-cat li.last-child:nth-child(1), #document-menu #sec-cat li.last-child:nth-child(1) a").trigger('click');
            $("#document-menu #sec-cat li.last-child:eq(0) a").trigger('click');
        }
    }
</script>